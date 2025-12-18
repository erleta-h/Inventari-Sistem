import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Depo, Produkt, Furnitor } from '../../types';

export const PranimMallinPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [depot, setDepot] = useState<Depo[]>([]);
  const [produktet, setProduktet] = useState<Produkt[]>([]);
  const [furnitoret, setFurnitoret] = useState<Furnitor[]>([]);
  const [furnitorType, setFurnitorType] = useState<'ekzistues' | 'i_ri' | 'pa'>('pa');
  const [produktType, setProduktType] = useState<'ekzistues' | 'i_ri'>('ekzistues');
  
  const [formData, setFormData] = useState({
    depo_id: '',
    produkt_id: '',
    sasia: '',
    furnitor_id: '',
    furnitor_emer: '',
  });

  const [produktFormData, setProduktFormData] = useState({
    emer: '',
    sku: '',
    pershkrimi: '',
    cmimi_njesi: '',
    stok_minimal_default: '0',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depotRes, produktetRes, furnitoretRes] = await Promise.all([
          apiClient.get<{ status?: string; data?: Depo[] } | Depo[]>('/depot'),
          apiClient.get<{ status?: string; data?: Produkt[] } | Produkt[]>('/produktet'),
          apiClient.get<{ status?: string; data?: Furnitor[] } | Furnitor[]>('/furnitoret'),
        ]);

        // Trajto të dy formatet: { status, data } ose array direkt
        const depotData = Array.isArray(depotRes.data) ? depotRes.data : (depotRes.data as any)?.data || depotRes.data;
        const produktetData = Array.isArray(produktetRes.data) ? produktetRes.data : (produktetRes.data as any)?.data || produktetRes.data;
        const furnitoretData = Array.isArray(furnitoretRes.data) ? furnitoretRes.data : (furnitoretRes.data as any)?.data || furnitoretRes.data;

        setDepot(Array.isArray(depotData) ? depotData : []);
        setProduktet(Array.isArray(produktetData) ? produktetData : []);
        setFurnitoret(Array.isArray(furnitoretData) ? furnitoretData : []);
      } catch (err) {
        console.error('Gabim në marrjen e të dhënave:', err);
        setError('Gabim në marrjen e të dhënave');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validimi
    if (!formData.depo_id || !formData.sasia) {
      setError('Depo dhe sasia janë të detyrueshme');
      return;
    }

    // Validimi për produkt
    if (produktType === 'ekzistues' && !formData.produkt_id) {
      setError('Duhet të zgjidhni një produkt');
      return;
    }

    if (produktType === 'i_ri') {
      if (!produktFormData.emer || !produktFormData.sku || !produktFormData.cmimi_njesi) {
        setError('Emri, SKU dhe çmimi i produktit të ri janë të detyrueshme');
        return;
      }
    }

    const sasia = Number(formData.sasia);
    if (isNaN(sasia) || sasia <= 0) {
      setError('Sasia duhet të jetë një numër pozitiv');
      return;
    }

    // Validimi për furnitor
    if (furnitorType === 'ekzistues' && !formData.furnitor_id) {
      setError('Duhet të zgjidhni një furnitor');
      return;
    }

    if (furnitorType === 'i_ri' && !formData.furnitor_emer.trim()) {
      setError('Duhet të shkruani emrin e furnitorit');
      return;
    }

    setLoading(true);

    try {
      let produktId = Number(formData.produkt_id);

      // Nëse është produkt i ri, krijoje fillimisht
      if (produktType === 'i_ri') {
        const cmimiNjesi = Number(produktFormData.cmimi_njesi);
        if (isNaN(cmimiNjesi) || cmimiNjesi < 0) {
          setError('Çmimi duhet të jetë një numër pozitiv');
          setLoading(false);
          return;
        }

        const produktResponse = await apiClient.post<{ status: string; data: Produkt }>('/produktet', {
          emer: produktFormData.emer.trim(),
          sku: produktFormData.sku.trim(),
          pershkrimi: produktFormData.pershkrimi.trim() || null,
          cmimi_njesi: cmimiNjesi,
          stok_minimal_default: Number(produktFormData.stok_minimal_default) || 0,
          is_active: true,
        });

        if (produktResponse.data.status === 'success' && produktResponse.data.data?.id) {
          produktId = produktResponse.data.data.id;
        } else {
          throw new Error('Produkti u krijua por nuk u kthye ID');
        }
      }

      const requestBody: any = {
        depo_id: Number(formData.depo_id),
        produkt_id: produktId,
        sasia: sasia,
      };

      // Shto furnitor nëse është zgjedhur
      if (furnitorType === 'ekzistues') {
        requestBody.furnitor_id = Number(formData.furnitor_id);
      } else if (furnitorType === 'i_ri') {
        requestBody.furnitor_emer = formData.furnitor_emer.trim();
      }

      const response = await apiClient.post<{ status: string; data: any }>('/inventar/pranim', requestBody);

      if (response.data.status === 'success') {
        setSuccess('Malli u pranua me sukses!');
        
        // Reset form
        setFormData({
          depo_id: '',
          produkt_id: '',
          sasia: '',
          furnitor_id: '',
          furnitor_emer: '',
        });
        setProduktFormData({
          emer: '',
          sku: '',
          pershkrimi: '',
          cmimi_njesi: '',
          stok_minimal_default: '0',
        });
        setFurnitorType('pa');
        setProduktType('ekzistues');

        // Refresh produktet për të përfshirë produktin e ri
        try {
          const produktetRes = await apiClient.get<{ status?: string; data?: Produkt[] } | Produkt[]>('/produktet');
          const produktetData = Array.isArray(produktetRes.data) ? produktetRes.data : (produktetRes.data as any)?.data || produktetRes.data;
          setProduktet(Array.isArray(produktetData) ? produktetData : []);
        } catch (err) {
          console.error('Gabim në refresh të produkteve:', err);
        }

        // Redirect pas 2 sekondave
        setTimeout(() => {
          navigate('/inventar');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gabim në pranimin e mallit';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Pranim Malli</h1>
          <p className="text-gray-600">Regjistro malli që ka ardhur në depo</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Depo <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.depo_id}
              onChange={(e) => setFormData({ ...formData, depo_id: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Zgjidh Depon</option>
              {depot.filter(d => d.status === 'AKTIV').map((depo) => (
                <option key={depo.id} value={depo.id}>
                  {depo.emer} ({depo.kod})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-3">
              Produkt <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ekzistues"
                  checked={produktType === 'ekzistues'}
                  onChange={(e) => setProduktType(e.target.value as 'ekzistues')}
                  className="mr-2"
                />
                <span className="text-gray-700">Produkt Ekzistues</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="i_ri"
                  checked={produktType === 'i_ri'}
                  onChange={(e) => setProduktType(e.target.value as 'i_ri')}
                  className="mr-2"
                />
                <span className="text-gray-700">Produkt i Ri</span>
              </label>
            </div>

            {produktType === 'ekzistues' ? (
              <select
                required={produktType === 'ekzistues'}
                value={formData.produkt_id}
                onChange={(e) => setFormData({ ...formData, produkt_id: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Zgjidh Produktin</option>
                {produktet.filter(p => p.is_active).map((produkt) => (
                  <option key={produkt.id} value={produkt.id}>
                    {produkt.emer} ({produkt.sku})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-lg font-semibold mb-4">Të dhënat e Produktit të Ri</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Emër <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={produktFormData.emer}
                      onChange={(e) => setProduktFormData({ ...produktFormData, emer: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Shkruaj emrin e produktit"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={produktFormData.sku}
                      onChange={(e) => setProduktFormData({ ...produktFormData, sku: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Shkruaj SKU-në e produktit"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Çmimi për Njësi (EUR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={produktFormData.cmimi_njesi}
                        onChange={(e) => setProduktFormData({ ...produktFormData, cmimi_njesi: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Stok Minimal Default
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={produktFormData.stok_minimal_default}
                        onChange={(e) => setProduktFormData({ ...produktFormData, stok_minimal_default: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Përshkrimi</label>
                    <textarea
                      value={produktFormData.pershkrimi}
                      onChange={(e) => setProduktFormData({ ...produktFormData, pershkrimi: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows={3}
                      placeholder="Përshkrimi i produktit (opsional)"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sasia <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.sasia}
              onChange={(e) => setFormData({ ...formData, sasia: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Shkruaj sasinë e mallit që ka hyrë"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-3">
              Furnitor (Opsional)
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pa"
                  checked={furnitorType === 'pa'}
                  onChange={(e) => setFurnitorType(e.target.value as 'pa')}
                  className="mr-2"
                />
                <span className="text-gray-700">Pa Furnitor</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ekzistues"
                  checked={furnitorType === 'ekzistues'}
                  onChange={(e) => setFurnitorType(e.target.value as 'ekzistues')}
                  className="mr-2"
                />
                <span className="text-gray-700">Furnitor Ekzistues</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="i_ri"
                  checked={furnitorType === 'i_ri'}
                  onChange={(e) => setFurnitorType(e.target.value as 'i_ri')}
                  className="mr-2"
                />
                <span className="text-gray-700">Furnitor i Ri</span>
              </label>
            </div>

            {furnitorType === 'ekzistues' && (
              <select
                value={formData.furnitor_id}
                onChange={(e) => setFormData({ ...formData, furnitor_id: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Zgjidh Furnitorin</option>
                {furnitoret.filter(f => f.is_active).map((furnitor) => (
                  <option key={furnitor.id} value={furnitor.id}>
                    {furnitor.emer}
                  </option>
                ))}
              </select>
            )}

            {furnitorType === 'i_ri' && (
              <input
                type="text"
                value={formData.furnitor_emer}
                onChange={(e) => setFormData({ ...formData, furnitor_emer: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Shkruaj emrin e furnitorit"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/inventar')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Duke pranuar...' : 'Prano Mallin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};