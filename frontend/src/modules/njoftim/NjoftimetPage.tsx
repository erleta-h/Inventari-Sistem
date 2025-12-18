import React, { useEffect, useState } from 'react';
import apiClient from '../../config/apiClient';
import { Njoftim } from '../../types';

export const NjoftimetPage: React.FC = () => {
  const [njoftimet, setNjoftimet] = useState<Njoftim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'te_gjitha' | 'te_paleksuar'>('te_paleksuar');

  useEffect(() => {
    const fetchNjoftimet = async () => {
      try {
        const endpoint = filter === 'te_paleksuar' ? '/njoftimet/te-paleksuar' : '/njoftimet';
        const response = await apiClient.get<Njoftim[]>(endpoint);
        setNjoftimet(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Gabim në marrjen e njoftimeve:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNjoftimet();
  }, [filter]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.put(`/njoftimet/${id}/lexuar`);
      // Refresh njoftimet
      const endpoint = filter === 'te_paleksuar' ? '/njoftimet/te-paleksuar' : '/njoftimet';
      const response = await apiClient.get<Njoftim[]>(endpoint);
      setNjoftimet(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gabim në shënimin e njoftimit si të lexuar:', error);
    }
  };

  const getTipiColor = (tipi: string) => {
    switch (tipi) {
      case 'LOW_STOCK':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'DELIVERY_ALERT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SYSTEM_ALERT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTipiLabel = (tipi: string) => {
    switch (tipi) {
      case 'LOW_STOCK':
        return 'Stok Minimal';
      case 'DELIVERY_ALERT':
        return 'Dërgesa';
      case 'SYSTEM_ALERT':
        return 'Sistem';
      default:
        return tipi;
    }
  };

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Njoftimet</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('te_paleksuar')}
            className={`px-4 py-2 rounded ${
              filter === 'te_paleksuar'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Të Palexuara ({njoftimet.filter(n => !n.is_read).length})
          </button>
          <button
            onClick={() => setFilter('te_gjitha')}
            className={`px-4 py-2 rounded ${
              filter === 'te_gjitha'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Të Gjitha
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {njoftimet.length === 0 ? (
          <div className="bg-white shadow rounded p-6 text-center text-gray-500">
            Nuk ka njoftime {filter === 'te_paleksuar' ? 'të palexuara' : ''}
          </div>
        ) : (
          njoftimet.map((njoftim) => (
            <div
              key={njoftim.id}
              className={`bg-white shadow rounded-lg border-l-4 ${
                njoftim.is_read
                  ? 'border-gray-300 opacity-75'
                  : getTipiColor(njoftim.tipi).split(' ')[0] + ' border-l-4'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getTipiColor(njoftim.tipi)}`}
                      >
                        {getTipiLabel(njoftim.tipi)}
                      </span>
                      {!njoftim.is_read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {njoftim.titulli}
                    </h3>
                    <p className="text-gray-700 mb-2">{njoftim.mesazhi}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(njoftim.created_at).toLocaleString('sq-AL')}
                    </p>
                  </div>
                  {!njoftim.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(njoftim.id)}
                      className="ml-4 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Shëno si të lexuar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};



