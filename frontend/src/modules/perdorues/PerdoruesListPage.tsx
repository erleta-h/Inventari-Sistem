import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { RoleName } from '../../types';

interface Perdorues {
  id: number;
  emer: string;
  email: string;
  telefoni?: string;
  is_active: boolean;
  rolet?: { name: RoleName }[];
}

export const PerdoruesListPage: React.FC = () => {
  const [perdoruesit, setPerdoruesit] = useState<Perdorues[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerdoruesit = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Perdorues[] }>('/perdoruesit');
        setPerdoruesit(response.data.data || response.data);
      } catch (error) {
        console.error('Gabim në marrjen e përdoruesve:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerdoruesit();
  }, []);

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Përdoruesit</h1>
        <Link
          to="/perdoruesit/krijo"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Përdorues i Ri
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emër
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rolet
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
            {perdoruesit.map((perdorues) => (
              <tr key={perdorues.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {perdorues.emer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {perdorues.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {perdorues.telefoni || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {perdorues.rolet?.map((r) => r.name).join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {perdorues.is_active ? (
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
                    to={`/perdoruesit/${perdorues.id}`}
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

