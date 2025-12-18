import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { useAuth } from '../../context/AuthContext';
import { RoleName } from '../../types';

interface MjetTransportues {
  id: number;
  targa: string;
  modeli?: string;
  kapaciteti?: number;
  status: 'AKTIV' | 'NE_MIREMBAJTJE' | 'JO_DISPONUESHME';
  is_active: boolean;
}

export const MjetetListPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [mjetet, setMjetet] = useState<MjetTransportues[]>([]);
  const [loading, setLoading] = useState(true);
  const canCreateMjet = hasRole(RoleName.MENAXHER) || hasRole(RoleName.ADMIN);

  useEffect(() => {
    const fetchMjetet = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: MjetTransportues[] }>('/mjetet-transportuese');
  
        setMjetet(response.data.data || response.data);
      } catch (error) {
        console.error('Gabim në marrjen e mjeteve:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMjetet();
  }, []);
  

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIV':
        return 'bg-green-100 text-green-800';
      case 'NE_MIREMBAJTJE':
        return 'bg-yellow-100 text-yellow-800';
      case 'JO_DISPONUESHME':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mjetet Transportuese</h1>
        {canCreateMjet && (
          <Link
            to="/mjetet-transportuese/krijo"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Mjet i Ri
          </Link>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Targë
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kapacitet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktiv
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veprime
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mjetet.map((mjet) => (
              <tr key={mjet.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {mjet.targa}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mjet.modeli || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mjet.kapaciteti || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mjet.status)}`}>
                    {mjet.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {mjet.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Po
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Jo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/mjetet/${mjet.id}`}
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