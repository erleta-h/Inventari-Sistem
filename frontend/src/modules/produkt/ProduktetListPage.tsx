import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Produkt } from '../../types';

export const ProduktetListPage: React.FC = () => {
  const [produktet, setProduktet] = useState<Produkt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduktet = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Produkt[] }>('/produktet');
        if (response.data.status === 'success' && response.data.data) {
          setProduktet(response.data.data); // <--- KJO është e duhur
        } else {
          setProduktet([]);
        }
        console.log('Produktet:', response.data.data); // vetëm array-i
      } catch (error) {
        console.error('Gabim në marrjen e produkteve:', error);
        setError('Gabim në marrjen e produkteve');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProduktet();
  }, []);
  
  

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produktet</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emër
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Çmim Njësi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok Minimal
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
            {produktet.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nuk ka produkte
                </td>
              </tr>
            ) : (
              produktet.map((produkt) => (
              <tr key={produkt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {produkt.emer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {produkt.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Number(produkt.cmimi_njesi).toFixed(2)} EUR
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {produkt.stok_minimal_default}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {produkt.is_active ? (
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
                    to={`/produktet/${produkt.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Shiko
                  </Link>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};