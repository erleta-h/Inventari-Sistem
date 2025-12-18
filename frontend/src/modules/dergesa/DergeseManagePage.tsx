import React, { useEffect, useState } from 'react';
import apiClient from '../../config/apiClient';
import { Dergese, Porosi, MjetTransportues, Perdorues, RoleName } from '../../types';

export const DergeseManagePage: React.FC = () => {
  const [dergesat, setDergesat] = useState<Dergese[]>([]);
  const [porosite, setPorosite] = useState<Porosi[]>([]);
  const [shoferet, setShoferet] = useState<Perdorues[]>([]);
  const [shoferetTeZene, setShoferetTeZene] = useState<number[]>([]);
  const [mjetet, setMjetet] = useState<MjetTransportues[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDergese, setSelectedDergese] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    shofer_id: '',
    mjet_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dergesatRes, porositeRes, mjetetRes, shoferetTeZeneRes] = await Promise.all([
          apiClient.get<{ status: string; data: Dergese[] }>('/dergesat'),
          apiClient.get<{ status: string; data: Porosi[] }>('/porosite'),
          apiClient.get<{ status: string; data: MjetTransportues[] }>('/mjetet-transportuese'),
          apiClient.get<{ status: string; data: { shoferet_te_zene: number[] } }>('/dergesat/shoferet/disponueshem?limit=5'),
        ]);

        setDergesat(dergesatRes.data.data || dergesatRes.data);
        setPorosite(porositeRes.data.data || porositeRes.data);
        setMjetet(mjetetRes.data.data || mjetetRes.data);
        setShoferetTeZene(shoferetTeZeneRes.data.data?.shoferet_te_zene || []);

        // Merr shoferët (përdoruesit me rol SHOFER)
        const perdoruesitRes = await apiClient.get<{ status: string; data: any[] }>('/perdoruesit');
        const perdoruesit = perdoruesitRes.data.data || perdoruesitRes.data;
        // Filtro vetëm ata që kanë rol SHOFER
        const shoferetFiltered = perdoruesit
          .filter((p: any) => {
            const hasShoferRole = p.rolet?.some((r: any) => r.name === RoleName.SHOFER || r.name === 'SHOFER');
            return hasShoferRole && p.is_active;
          })
          .map((p: any) => ({
            id: p.id,
            emer: p.emer,
            email: p.email,
          }));
        setShoferet(shoferetFiltered);
      } catch (err) {
        console.error('Gabim në marrjen e të dhënave:', err);
        setError('Gabim në marrjen e të dhënave');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCaktoShofer = async (dergeseId: number) => {
    if (!formData.shofer_id || !formData.mjet_id) {
      setError('Duhet të zgjidhni shofer dhe mjet');
      return;
    }

    try {
      await apiClient.put(`/dergesat/${dergeseId}/cakto`, {
        shofer_id: Number(formData.shofer_id),
        mjet_id: Number(formData.mjet_id),
      });

      // Refresh dërgesat dhe shoferët e zënë
      const [dergesatRes, shoferetTeZeneRes] = await Promise.all([
        apiClient.get<{ status: string; data: Dergese[] }>('/dergesat'),
        apiClient.get<{ status: string; data: { shoferet_te_zene: number[] } }>('/dergesat/shoferet/disponueshem?limit=5'),
      ]);
      setDergesat(dergesatRes.data.data || dergesatRes.data);
      setShoferetTeZene(shoferetTeZeneRes.data.data?.shoferet_te_zene || []);
      setSelectedDergese(null);
      setFormData({ shofer_id: '', mjet_id: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në caktimin e shoferit');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'ON_THE_WAY':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  // Gjej porositë që nuk kanë dërgesë
  const porositePaDergese = porosite.filter(porosi => 
    !dergesat.some(dergesa => dergesa.porosi_id === porosi.id)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Menaxho Dërgesat</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Porositë gati për nisje (READY_FOR_SHIPPING) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Porositë Gati për Nisje</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {porositePaDergese.filter(p => p.status === 'READY_FOR_SHIPPING').map((porosi) => (
              <li key={porosi.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Porosi #{porosi.id} - {porosi.klient?.emer || 'Klient i panjohur'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Totali: {porosi.total_amount} {porosi.currency}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await apiClient.post('/dergesat', { porosi_id: porosi.id });
                        const [dergesatRes, porositeRes] = await Promise.all([
                          apiClient.get<{ status: string; data: Dergese[] }>('/dergesat'),
                          apiClient.get<{ status: string; data: Porosi[] }>('/porosite'),
                        ]);
                        setDergesat(dergesatRes.data.data || dergesatRes.data);
                        setPorosite(porositeRes.data.data || porositeRes.data);
                      } catch (err: any) {
                        setError(err.response?.data?.message || 'Gabim në krijimin e dërgesës');
                      }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Krijo Dërgesë
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dërgesat */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Dërgesat</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {dergesat.map((dergesa) => (
              <li key={dergesa.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Dërgesa #{dergesa.id} - Porosi #{dergesa.porosi_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Klient: {dergesa.porosi?.klient?.emer || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shofer: {dergesa.shofer?.emer || 'Pa caktuar'} | Mjet: {dergesa.mjet?.targa || 'N/A'}
                    </p>
                    {dergesa.last_known_lat && dergesa.last_known_lng && (
                      <p className="text-xs text-blue-600 mt-1">
                        📍 GPS: {Number(dergesa.last_known_lat).toFixed(6)}, {Number(dergesa.last_known_lng).toFixed(6)}
                        <a
                          href={`https://www.google.com/maps?q=${Number(dergesa.last_known_lat)},${Number(dergesa.last_known_lng)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-500 hover:underline"
                        >
                          (Shiko në hartë)
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dergesa.status)}`}>
                      {dergesa.status}
                    </span>
                    {!dergesa.shofer_id && (
                      <button
                        onClick={() => setSelectedDergese(dergesa.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        Cakto Shofer
                      </button>
                    )}
                  </div>
                </div>

                {/* Form për caktimin e shoferit */}
                {selectedDergese === dergesa.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="text-sm font-semibold mb-3">Cakto Shofer dhe Mjet</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shofer
                        </label>
                        <select
                          value={formData.shofer_id}
                          onChange={(e) => setFormData({ ...formData, shofer_id: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="">Zgjidh Shoferin</option>
                          {shoferet
                            .filter(shofer => !shoferetTeZene.includes(shofer.id))
                            .map((shofer) => (
                              <option key={shofer.id} value={shofer.id}>
                                {shofer.emer}
                              </option>
                            ))}
                          {shoferet
                            .filter(shofer => shoferetTeZene.includes(shofer.id))
                            .length > 0 && (
                            <optgroup label="Shoferë të zënë (më shumë se 5 dërgesa për sot)">
                              {shoferet
                                .filter(shofer => shoferetTeZene.includes(shofer.id))
                                .map((shofer) => (
                                  <option key={shofer.id} value={shofer.id} disabled>
                                    {shofer.emer} (I zënë)
                                  </option>
                                ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mjet
                        </label>
                        <select
                          value={formData.mjet_id}
                          onChange={(e) => setFormData({ ...formData, mjet_id: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="">Zgjidh Mjetin</option>
                          {mjetet.filter(m => m.status === 'AKTIV' && m.is_active).map((mjet) => (
                            <option key={mjet.id} value={mjet.id}>
                              {mjet.targa} - {mjet.modeli || 'N/A'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCaktoShofer(dergesa.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Konfirmo
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDergese(null);
                          setFormData({ shofer_id: '', mjet_id: '' });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Anulo
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

