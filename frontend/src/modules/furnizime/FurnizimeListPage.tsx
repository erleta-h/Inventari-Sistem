import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';

interface PorosiFurnizimi {
  id: number;
  furnitor_id: number;
  depo_id: number;
  status: string;
  data_pritjes?: string;
  data_pranimit?: string;
  furnitor?: { emer: string };
  depo?: { emer: string };
}

export const FurnizimeListPage: React.FC = () => {
  const [porosite, setPorosite] = useState<PorosiFurnizimi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPorosite = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: PorosiFurnizimi[] }>('/porosi-furnizimi');
        setPorosite(response.data.data || response.data);
      } catch (error) {
        console.error('Gabim në marrjen e porosive të furnizimit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPorosite();
  }, []);

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Porositë e Furnizimit</h1>
        <Link
          to="/furnizime/krijo"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Porosi e Re
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {porosite.map((porosi) => (
            <li key={porosi.id}>
              <Link
                to={`/furnizime/${porosi.id}`}
                className="block hover:bg-gray-50 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Porosi #{porosi.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Furnitor: {porosi.furnitor?.emer || 'N/A'} | Depo: {porosi.depo?.emer || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{porosi.status}</p>
                    {porosi.data_pritjes && (
                      <p className="text-sm text-gray-500">
                        Data pritjes: {new Date(porosi.data_pritjes).toLocaleDateString()}
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