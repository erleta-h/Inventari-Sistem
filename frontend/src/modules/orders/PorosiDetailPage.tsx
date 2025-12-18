import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Porosi } from '../../types';

export const PorosiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [porosi, setPorosi] = useState<Porosi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shumaPaguar, setShumaPaguar] = useState('');
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    const fetchPorosi = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Porosi } | Porosi>(`/porosite/${id}`);
        const porosiData = (response.data as any).data || response.data;
        setPorosi(porosiData);
        setShumaPaguar(porosiData.shuma_paguar?.toString() || '0');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gabim në marrjen e porosisë');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPorosi();
    }
  }, [id]);

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!porosi) return;

    const shuma = Number(shumaPaguar);
    if (isNaN(shuma) || shuma < 0) {
      setError('Shuma e paguar duhet të jetë një numër pozitiv');
      return;
    }

    if (shuma > Number(porosi.total_amount)) {
      setError(`Shuma e paguar nuk mund të jetë më e madhe se totali (${Number(porosi.total_amount).toFixed(2)} EUR)`);
      return;
    }

    setUpdatingPayment(true);

    try {
      const response = await apiClient.put<{ status: string; data: Porosi }>(`/porosite/${id}/pagese`, {
        shuma_paguar: shuma,
      });

      if (response.data.status === 'success') {
        setPorosi(response.data.data);
        setSuccess('Pagesa u përditësua me sukses!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në përditësimin e pagesës');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  if (!porosi) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Porosia nuk u gjet
        </div>
      </div>
    );
  }

  const mbetja = Number(porosi.total_amount) - Number(porosi.shuma_paguar || 0);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/porosite')}
            className="text-indigo-600 hover:text-indigo-800 mb-4"
          >
            ← Kthehu te Porositë
          </button>
          <h1 className="text-2xl font-bold">Porosi #{porosi.id}</h1>
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

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Informacione Porosie</h2>
              <div className="space-y-2">
                <p><strong>Klienti:</strong> {porosi.klient?.emer || 'N/A'}</p>
                <p><strong>Depo:</strong> {porosi.depo?.emer || 'N/A'}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    porosi.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    porosi.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    porosi.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {porosi.status}
                  </span>
                </p>
                <p><strong>Data:</strong> {new Date(porosi.created_at || '').toLocaleString('sq-AL')}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Adresa e Dërgesës</h2>
              <div className="space-y-2">
                {porosi.adresa_dergeses && (
                  <p><strong>Adresa:</strong> {porosi.adresa_dergeses}</p>
                )}
                {porosi.qyteti && (
                  <p><strong>Qyteti:</strong> {porosi.qyteti}</p>
                )}
                {porosi.shteti && (
                  <p><strong>Shteti:</strong> {porosi.shteti}</p>
                )}
                {!porosi.adresa_dergeses && !porosi.qyteti && !porosi.shteti && (
                  <p className="text-gray-500">Nuk ka adresë të dërgesës</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Artikujt</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produkt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sasia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Çmimi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {porosi.artikujt?.map((artikull) => (
                  <tr key={artikull.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {artikull.produkt?.emer || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artikull.sasia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Number(artikull.cmimi_njesi).toFixed(2)} {porosi.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {Number(artikull.line_total).toFixed(2)} {porosi.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Totali:</span>
                  <span className="font-bold text-lg">{Number(porosi.total_amount).toFixed(2)} {porosi.currency}</span>
                </div>
                {porosi.parapagesa !== undefined && porosi.parapagesa > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Parapagesa:</span>
                    <span>{Number(porosi.parapagesa).toFixed(2)} {porosi.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-600">
                  <span>Paguar:</span>
                  <span>{Number(porosi.shuma_paguar || 0).toFixed(2)} {porosi.currency}</span>
                </div>
                {mbetja > 0 && (
                  <div className="flex justify-between text-orange-600 font-semibold border-t pt-2">
                    <span>Mbetja:</span>
                    <span>{mbetja.toFixed(2)} {porosi.currency}</span>
                  </div>
                )}
                {mbetja <= 0 && (
                  <div className="flex justify-between text-green-600 font-semibold border-t pt-2">
                    <span>Status:</span>
                    <span>E paguar plotësisht</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {porosi.status !== 'DELIVERED' && porosi.status !== 'CANCELLED' && (
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h3 className="text-lg font-semibold mb-4">Përditëso Pagesën</h3>
              <form onSubmit={handleUpdatePayment}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Shuma e Paguar
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={Number(porosi.total_amount)}
                    step="0.01"
                    value={shumaPaguar}
                    onChange={(e) => setShumaPaguar(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maksimumi: {Number(porosi.total_amount).toFixed(2)} {porosi.currency}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={updatingPayment}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  {updatingPayment ? 'Duke përditësuar...' : 'Përditëso Pagesën'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

