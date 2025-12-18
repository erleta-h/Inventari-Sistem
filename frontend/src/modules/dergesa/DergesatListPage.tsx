import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';

interface Dergese {
  id: number;
  porosi_id: number;
  shofer_id?: number;
  mjet_id?: number;
  status: string;
  last_known_lat?: number;
  last_known_lng?: number;
  started_at?: string;
  delivered_at?: string;
  shofer?: { emer: string };
  mjet?: { targa: string };
  porosi?: { id: number; klient?: { emer: string } };
}

export const DergesatListPage: React.FC = () => {
  const [dergesat, setDergesat] = useState<Dergese[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDergesat = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Dergese[] }>('/dergesat');
        setDergesat(response.data.data || response.data);
      } catch (error) {
        console.error('Gabim në marrjen e dërgesave:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDergesat();
  }, []);

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dërgesat</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {dergesat.map((dergesa) => (
            <li key={dergesa.id}>
              <Link
                to={`/dergesat/${dergesa.id}`}
                className="block hover:bg-gray-50 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dërgesa #{dergesa.id} - Porosi #{dergesa.porosi_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dergesa.porosi?.klient?.emer || 'Klient i panjohur'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shofer: {dergesa.shofer?.emer || 'Pa caktuar'} | Mjet: {dergesa.mjet?.targa || 'N/A'}
                    </p>
                    {dergesa.last_known_lat && dergesa.last_known_lng && (
                      <p className="text-xs text-gray-400">
                        GPS: {dergesa.last_known_lat.toFixed(6)}, {dergesa.last_known_lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dergesa.status)}`}>
                      {dergesa.status}
                    </span>
                    {dergesa.started_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Filluar: {new Date(dergesa.started_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

