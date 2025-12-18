import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Depo } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RoleName } from '../../types';

export const DepotListPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [depot, setDepot] = useState<Depo[]>([]);
  const [loading, setLoading] = useState(true);
  const canCreateDepo = hasRole(RoleName.MENAXHER) || hasRole(RoleName.ADMIN);

  useEffect(() => {
    const fetchDepot = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Depo[] }>('/depot');
        setDepot(response.data.data || response.data);
      } catch (error) {
        console.error('Gabim në marrjen e depove:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepot();
  }, []);

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Depot</h1>
        {canCreateDepo && (
          <Link
            to="/depot/krijo"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Depo e Re
          </Link>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emër
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kod
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresë
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kapacitet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veprime
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {depot.map((depo) => (
              <tr key={depo.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {depo.emer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {depo.kod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {depo.adresa || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {depo.kapaciteti || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {depo.status === 'AKTIV' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Aktiv
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Jo Aktiv
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/depot/${depo.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Shiko
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};