import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Porosi } from '../../types';

export const OrdersListPage: React.FC = () => {
  const [porosite, setPorosite] = useState<Porosi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPorosite = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Porosi[] }>('/porosite');
        setPorosite(response.data.data || response.data);
      } catch (error) {
        console.error('Gabim në marrjen e porosive:', error);
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
        <h1 className="text-2xl font-bold">Porositë</h1>
        <Link
          to="/porosite/krijo"
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
                to={`/porosite/${porosi.id}`}
                className="block hover:bg-gray-50 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Porosi #{porosi.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {porosi.klient?.emer || 'Klient i panjohur'}
                    </p>
                    {porosi.adresa_dergeses && (
                      <p className="text-xs text-gray-400 mt-1">
                        📍 {porosi.adresa_dergeses}
                        {porosi.qyteti && `, ${porosi.qyteti}`}
                        {porosi.shteti && `, ${porosi.shteti}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Total: {Number(porosi.total_amount).toFixed(2)} {porosi.currency}
                    </p>
                    {porosi.parapagesa !== undefined && porosi.parapagesa > 0 && (
                      <p className="text-xs text-blue-600">
                        Parapagesa: {Number(porosi.parapagesa).toFixed(2)} {porosi.currency}
                      </p>
                    )}
                    {porosi.shuma_paguar !== undefined && (
                      <p className="text-xs text-green-600">
                        Paguar: {Number(porosi.shuma_paguar).toFixed(2)} {porosi.currency}
                      </p>
                    )}
                    {porosi.shuma_paguar !== undefined && porosi.total_amount > porosi.shuma_paguar && (
                      <p className="text-xs text-orange-600">
                        Mbetja: {(Number(porosi.total_amount) - Number(porosi.shuma_paguar)).toFixed(2)} {porosi.currency}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{porosi.status}</p>
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

