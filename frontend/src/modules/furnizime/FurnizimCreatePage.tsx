import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { PorosiFurnizimi, Furnitor, Depo, Produkt } from '../../types';

interface ArtikullForm {
  produkt_id: number;
  sasia_porositur: number;
  cmimi_njesi: number;
}

export const FurnizimCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [furnitoret, setFurnitoret] = useState<Furnitor[]>([]);
  const [depot, setDepot] = useState<Depo[]>([]);
  const [produktet, setProduktet] = useState<Produkt[]>([]);
  const [formData, setFormData] = useState({
    furnitor_id: '',
    depo_id: '',
    data_pritjes: '',
  });
  const [artikujt, setArtikujt] = useState<ArtikullForm[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [furnitoretRes, depotRes, produktetRes] = await Promise.all([
          apiClient.get<{ status: string; data: Furnitor[] }>('/furnitoret'),
          apiClient.get<{ status: string; data: Depo[] }>('/depot'),
          apiClient.get<{ status: string; data: Produkt[] }>('/produktet'),
        ]);
        setFurnitoret(furnitoretRes.data.data || furnitoretRes.data);
        setDepot(depotRes.data.data || depotRes.data);
        setProduktet(produktetRes.data.data || produktetRes.data);
      } catch (err) {
        console.error('Gabim në marrjen e të dhënave:', err);
      }
    };
    fetchData();
  }, []);

  const handleAddArtikull = () => {
    setArtikujt([...artikujt, { produkt_id: 0, sasia_porositur: 0, cmimi_njesi: 0 }]);
  };

  const handleRemoveArtikull = (index: number) => {
    setArtikujt(artikujt.filter((_, i) => i !== index));
  };

  const handleArtikullChange = (index: number, field: keyof ArtikullForm, value: number) => {
    const newArtikujt = [...artikujt];
    newArtikujt[index] = { ...newArtikujt[index], [field]: value };
    setArtikujt(newArtikujt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.furnitor_id || !formData.depo_id) {
      setError('Furnitori dhe Depo janë të detyrueshme');
      return;
    }

    if (artikujt.length === 0) {
      setError('Duhet të shtoni të paktën një artikull');
      return;
    }

    if (artikujt.some(a => a.produkt_id === 0 || a.sasia_porositur <= 0 || a.cmimi_njesi <= 0)) {
      setError('Të gjitha artikujt duhet të kenë produkt, sasi dhe çmim të vlefshme');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post<{ status: string; data: PorosiFurnizimi }>('/porosi-furnizimi', {
        furnitor_id: Number(formData.furnitor_id),
        depo_id: Number(formData.depo_id),
        artikujt: artikujt.map(a => ({
          produkt_id: a.produkt_id,
          sasia_porositur: a.sasia_porositur,
          cmimi_njesi: a.cmimi_njesi,
        })),
        data_pritjes: formData.data_pritjes || null,
      });
      navigate('/furnizime');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në krijimin e porosisë së furnizimit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Krijo Porosi Furnizimi të Re</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Furnitori <span className="text-red-500">*</span>
              </label>
              <select
                required
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
            </div>

            <div>
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
                    {depo.emer}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Data e Pritjes</label>
            <input
              type="date"
              value={formData.data_pritjes}
              onChange={(e) => setFormData({ ...formData, data_pritjes: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Artikujt</h2>
            {artikujt.map((artikull, index) => (
              <div key={index} className="flex gap-4 mb-4 items-end">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Produkti</label>
                  <select
                    value={artikull.produkt_id}
                    onChange={(e) => handleArtikullChange(index, 'produkt_id', Number(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="0">Zgjidh Produktin</option>
                    {produktet.filter(p => p.is_active).map((produkt) => (
                      <option key={produkt.id} value={produkt.id}>
                        {produkt.emer}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Sasia</label>
                  <input
                    type="number"
                    min="1"
                    value={artikull.sasia_porositur}
                    onChange={(e) => handleArtikullChange(index, 'sasia_porositur', Number(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Çmimi (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={artikull.cmimi_njesi}
                    onChange={(e) => handleArtikullChange(index, 'cmimi_njesi', Number(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveArtikull(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Fshi
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddArtikull}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              + Shto Artikull
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/furnizime')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Duke krijuar...' : 'Krijo Porosi Furnizimi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};