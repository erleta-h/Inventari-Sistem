import React, { useEffect, useState } from 'react';
import apiClient from '../../config/apiClient';
import { Porosi, RoleName } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const PorosiPergatitjePage: React.FC = () => {
  const [porosite, setPorosite] = useState<Porosi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasRole } = useAuth();
  const isMenaxher = hasRole(RoleName.MENAXHER);

  useEffect(() => {
    const fetchPorosite = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Porosi[] }>('/porosite');
        const porositeData = response.data.data || response.data;
        
        // Nëse është menaxher, shfaq të gjitha porositë
        // Nëse është magazinier, shfaq vetëm ato që janë CONFIRMED ose PREPARING
        const porositePerPergatitje = isMenaxher
          ? porositeData
          : porositeData.filter(
              p => p.status === 'CONFIRMED' || p.status === 'PREPARING'
            );
        
        setPorosite(porositePerPergatitje);
      } catch (err) {
        console.error('Gabim në marrjen e porosive:', err);
        setError('Gabim në marrjen e porosive');
      } finally {
        setLoading(false);
      }
    };

    fetchPorosite();
  }, [isMenaxher]);

  const handleFilloPergatitje = async (porosiId: number) => {
    try {
      await apiClient.put(`/porosite/${porosiId}/fillo-pergatitje`);
      // Refresh porositë
      const response = await apiClient.get<{ status: string; data: Porosi[] }>('/porosite');
      const porositeData = response.data.data || response.data;
      const porositePerPergatitje = isMenaxher
        ? porositeData
        : porositeData.filter(
            p => p.status === 'CONFIRMED' || p.status === 'PREPARING'
          );
      setPorosite(porositePerPergatitje);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në fillimin e përgatitjes');
    }
  };

  const handleBejGati = async (porosiId: number) => {
    try {
      await apiClient.put(`/porosite/${porosiId}/bej-gati`);
      // Refresh porositë
      const response = await apiClient.get<{ status: string; data: Porosi[] }>('/porosite');
      const porositeData = response.data.data || response.data;
      const porositePerPergatitje = isMenaxher
        ? porositeData
        : porositeData.filter(
            p => p.status === 'CONFIRMED' || p.status === 'PREPARING'
          );
      setPorosite(porositePerPergatitje);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në shënimin e porosisë si gati');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800';
      case 'READY_FOR_SHIPPING':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isMenaxher ? 'Të Gjitha Porositë' : 'Përgatitje Porosish'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {porosite.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            {isMenaxher ? 'Nuk ka porosi' : 'Nuk ka porosi për përgatitje'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {porosite.map((porosi) => (
              <li key={porosi.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Porosi #{porosi.id} - {porosi.klient?.emer || 'Klient i panjohur'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Totali: {porosi.total_amount} {porosi.currency}
                    </p>
                    {porosi.adresa_dergeses && (
                      <p className="text-sm text-gray-500 mt-1">
                        Adresa: {porosi.adresa_dergeses}
                        {porosi.qyteti && `, ${porosi.qyteti}`}
                        {porosi.shteti && `, ${porosi.shteti}`}
                      </p>
                    )}
                    {porosi.artikujt && porosi.artikujt.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 font-semibold">Artikujt:</p>
                        <ul className="text-xs text-gray-500 mt-1">
                          {porosi.artikujt.map((artikull, idx) => (
                            <li key={idx}>
                              - {artikull.produkt?.emer || 'N/A'}: {artikull.sasia} njësi
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2 items-end">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(porosi.status)}`}>
                      {porosi.status}
                    </span>
                    {!isMenaxher && porosi.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleFilloPergatitje(porosi.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        Filloni Përgatitjen
                      </button>
                    )}
                    {!isMenaxher && porosi.status === 'PREPARING' && (
                      <button
                        onClick={() => handleBejGati(porosi.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        Shëno si Gati
                      </button>
                    )}
                    {isMenaxher && (porosi.status === 'CONFIRMED' || porosi.status === 'PREPARING') && (
                      <div className="flex gap-2">
                        {porosi.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleFilloPergatitje(porosi.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                          >
                            Filloni Përgatitjen
                          </button>
                        )}
                        {porosi.status === 'PREPARING' && (
                          <button
                            onClick={() => handleBejGati(porosi.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                          >
                            Shëno si Gati
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

