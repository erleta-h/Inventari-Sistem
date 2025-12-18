import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Depo, Produkt, Inventar } from '../../types';

export const TransferDepoPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [depot, setDepot] = useState<Depo[]>([]);
  const [produktet, setProduktet] = useState<Produkt[]>([]);
  const [inventari, setInventari] = useState<Inventar[]>([]);
  
  const [formData, setFormData] = useState({
    produkt_id: '',
    from_depo_id: '',
    to_depo_id: '',
    sasia: '',
  });

  const [stokuNeDepo, setStokuNeDepo] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depotRes, produktetRes, inventariRes] = await Promise.all([
          apiClient.get<{ status?: string; data?: Depo[] } | Depo[]>('/depot'),
          apiClient.get<{ status?: string; data?: Produkt[] } | Produkt[]>('/produktet'),
          apiClient.get<{ status?: string; data?: Inventar[] } | Inventar[]>('/inventar'),
        ]);

        // Trajto të dy formatet: { status, data } ose array direkt
        const depotData = Array.isArray(depotRes.data) ? depotRes.data : (depotRes.data as any)?.data || depotRes.data;
        const produktetData = Array.isArray(produktetRes.data) ? produktetRes.data : (produktetRes.data as any)?.data || produktetRes.data;
        const inventariData = Array.isArray(inventariRes.data) ? inventariRes.data : (inventariRes.data as any)?.data || inventariRes.data;

        setDepot(Array.isArray(depotData) ? depotData : []);
        setProduktet(Array.isArray(produktetData) ? produktetData : []);
        setInventari(Array.isArray(inventariData) ? inventariData : []);
      } catch (err) {
        console.error('Gabim në marrjen e të dhënave:', err);
        setError('Gabim në marrjen e të dhënave');
      }
    };
    fetchData();
  }, []);

  // Kur ndryshohet produkti ose depo burimore, kontrollo stokun
  useEffect(() => {
    if (formData.produkt_id && formData.from_depo_id) {
      const inventar = inventari.find(
        (inv) => 
          inv.produkt_id === Number(formData.produkt_id) && 
          inv.depo_id === Number(formData.from_depo_id)
      );
      setStokuNeDepo(inventar ? inventar.sasia : 0);
    } else {
      setStokuNeDepo(null);
    }
  }, [formData.produkt_id, formData.from_depo_id, inventari]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validimi
    if (!formData.produkt_id || !formData.from_depo_id || !formData.to_depo_id || !formData.sasia) {
      setError('Të gjitha fushat janë të detyrueshme');
      return;
    }

    if (formData.from_depo_id === formData.to_depo_id) {
      setError('Depo burimore dhe destinacion nuk mund të jenë të njëjta');
      return;
    }

    const sasia = Number(formData.sasia);
    if (isNaN(sasia) || sasia <= 0) {
      setError('Sasia duhet të jetë një numër pozitiv');
      return;
    }

    if (stokuNeDepo !== null && sasia > stokuNeDepo) {
      setError(`Stoku në depo burimore është ${stokuNeDepo}. Nuk mund të transferoni më shumë se sa ka në stok.`);
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post<{ status: string; data: any }>('/inventar/transfer', {
        produkt_id: Number(formData.produkt_id),
        from_depo_id: Number(formData.from_depo_id),
        to_depo_id: Number(formData.to_depo_id),
        sasia: sasia,
      });

      if (response.data.status === 'success') {
        setSuccess('Transferi u krye me sukses!');
        
        // Reset form
        setFormData({
          produkt_id: '',
          from_depo_id: '',
          to_depo_id: '',
          sasia: '',
        });
        setStokuNeDepo(null);

        // Refresh inventari
        try {
          const inventariRes = await apiClient.get<{ status?: string; data?: Inventar[] } | Inventar[]>('/inventar');
          const inventariData = Array.isArray(inventariRes.data) ? inventariRes.data : (inventariRes.data as any)?.data || inventariRes.data;
          setInventari(Array.isArray(inventariData) ? inventariData : []);
        } catch (err) {
          console.error('Gabim në refresh të inventarit:', err);
        }

        // Redirect pas 2 sekondave
        setTimeout(() => {
          navigate('/inventar');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gabim në transferimin e produkteve';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filtro produktet që kanë stok në të paktën një depo
  const produktetMeStok = produktet.filter((produkt) =>
    inventari.some((inv) => inv.produkt_id === produkt.id && inv.sasia > 0)
  );

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Transfer Mes Depove</h1>
          <p className="text-gray-600">Transfero produkte nga një depo në tjetrën</p>
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
              Produkt <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.produkt_id}
              onChange={(e) => setFormData({ ...formData, produkt_id: e.target.value, from_depo_id: '', to_depo_id: '', sasia: '' })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Zgjidh Produktin</option>
              {produktetMeStok.filter(p => p.is_active).map((produkt) => (
                <option key={produkt.id} value={produkt.id}>
                  {produkt.emer} ({produkt.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Depo Burimore <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.from_depo_id}
              onChange={(e) => {
                setFormData({ ...formData, from_depo_id: e.target.value, to_depo_id: '', sasia: '' });
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Zgjidh Depo Burimore</option>
              {depot
                .filter(d => d.status === 'AKTIV')
                .filter(depo => {
                  if (!formData.produkt_id) return true;
                  const inventar = inventari.find(
                    inv => inv.depo_id === depo.id && inv.produkt_id === Number(formData.produkt_id) && inv.sasia > 0
                  );
                  return inventar !== undefined;
                })
                .map((depo) => (
                  <option key={depo.id} value={depo.id}>
                    {depo.emer} ({depo.kod})
                  </option>
                ))}
            </select>
            {stokuNeDepo !== null && (
              <p className="mt-2 text-sm text-gray-600">
                Stoku në këtë depo: <span className="font-semibold">{stokuNeDepo}</span>
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Depo Destinacion <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.to_depo_id}
              onChange={(e) => setFormData({ ...formData, to_depo_id: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Zgjidh Depo Destinacion</option>
              {depot
                .filter(d => d.status === 'AKTIV')
                .filter(depo => depo.id !== Number(formData.from_depo_id))
                .map((depo) => (
                  <option key={depo.id} value={depo.id}>
                    {depo.emer} ({depo.kod})
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sasia <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max={stokuNeDepo !== null ? stokuNeDepo : undefined}
              value={formData.sasia}
              onChange={(e) => setFormData({ ...formData, sasia: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Shkruaj sasinë për transfer"
            />
            {stokuNeDepo !== null && (
              <p className="mt-2 text-sm text-gray-500">
                Maksimumi: {stokuNeDepo}
              </p>
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
              {loading ? 'Duke transferuar...' : 'Transfero Produktet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};