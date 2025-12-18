import React, { useEffect, useState } from 'react';
import apiClient from '../../config/apiClient';

interface PorosiFurnizimi {
  id: number;
  furnitor?: { emer: string };
  depo?: { emer: string };
  status: string;
  data_pranimit: string | null;
  created_at: string;
  artikujt?: Array<{
    id: number;
    produkt?: { emer: string };
    sasia_porositur: number;
    sasia_pranuar: number;
    cmimi_njesi: number;
  }>;
}

interface Porosi {
  id: number;
  klient?: { emer: string };
  depo?: { emer: string };
  status: string;
  total_amount: number;
  shuma_paguar: number;
  created_at: string;
  artikujt?: Array<{
    id: number;
    produkt?: { emer: string };
    sasia: number;
    cmimi_njesi: number;
  }>;
}

interface PranimManual {
  transaksion_id: number;
  sasia_delta: number;
  created_at: string;
  furnitor_id: number | null;
  furnitor_emer: string | null;
  depo_id: number;
  produkt_id: number;
  produkt_emer: string;
  depo_emer: string;
}

interface RaportFinanciar {
  total_hyrat: number;
  total_mall_i_marre: number;
  total_shpenzime: number;
  fitimi_humbja: number;
  eshte_plus: boolean;
  porosite_furnizimi?: PorosiFurnizimi[];
  porosite_dorëzuar?: Porosi[];
  pranimet_manuale?: PranimManual[];
}

export const RaportetPage: React.FC = () => {
  const [raportFinanciar, setRaportFinanciar] = useState<RaportFinanciar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaporte = async () => {
      try {
        const financiarRes = await apiClient.get<{ status: string; data: RaportFinanciar }>('/raportet/financiar');
        const raportData = financiarRes.data.data || financiarRes.data;
        setRaportFinanciar(raportData);
      } catch (error) {
        console.error('Gabim në marrjen e raporteve:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaporte();
  }, []);

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        📊 Raportet Financiare
      </h1>

      {raportFinanciar && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Të Hyrat */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl shadow-lg border-2 border-green-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Të Hyrat</h3>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-green-100">
              <p className="text-sm font-semibold text-gray-600 mb-1">Total i Paguar</p>
              <p className="text-3xl font-bold text-green-700">
                {raportFinanciar.total_hyrat.toFixed(2)} EUR
              </p>
            </div>
          </div>

          {/* Malli i Marrë */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Malli i Marrë</h3>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-blue-100">
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Sasi</p>
              <p className="text-3xl font-bold text-indigo-700">
                {raportFinanciar.total_mall_i_marre.toFixed(0)} njësi
              </p>
            </div>
          </div>

          {/* Shpenzimet */}
          <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-xl shadow-lg border-2 border-orange-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                <span className="text-2xl">💸</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Shpenzimet</h3>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-orange-100">
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Kosto</p>
              <p className="text-3xl font-bold text-orange-700">
                {raportFinanciar.total_shpenzime.toFixed(2)} EUR
              </p>
            </div>
          </div>

          {/* Fitimi/Humbja */}
          <div className={`bg-gradient-to-br ${raportFinanciar.eshte_plus 
            ? 'from-green-50 via-emerald-50 to-teal-50 border-green-200' 
            : 'from-red-50 via-rose-50 to-pink-50 border-red-200'
          } rounded-xl shadow-lg border-2 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 bg-gradient-to-br ${raportFinanciar.eshte_plus
                ? 'from-green-500 to-emerald-600'
                : 'from-red-500 to-rose-600'
              } rounded-lg shadow-md`}>
                <span className="text-2xl">{raportFinanciar.eshte_plus ? '📈' : '📉'}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {raportFinanciar.eshte_plus ? 'Fitim' : 'Humbje'}
              </h3>
            </div>
            <div className={`bg-white/60 rounded-lg p-4 border ${raportFinanciar.eshte_plus 
              ? 'border-green-100' 
              : 'border-red-100'
            }`}>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                {raportFinanciar.eshte_plus ? 'Plus' : 'Minus'}
              </p>
              <p className={`text-3xl font-bold ${raportFinanciar.eshte_plus 
                ? 'text-green-700' 
                : 'text-red-700'
              }`}>
                {raportFinanciar.eshte_plus ? '+' : ''}{raportFinanciar.fitimi_humbja.toFixed(2)} EUR
              </p>
            </div>
          </div>
        </div>
      )}

      {!raportFinanciar && !loading && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">Nuk u gjetën të dhëna për raportin financiar.</p>
        </div>
      )}

      {/* Detajet e Pranimeve Manuale */}
      {raportFinanciar && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📥 Detajet e Pranimeve Manuale</h2>
          {raportFinanciar.pranimet_manuale && Array.isArray(raportFinanciar.pranimet_manuale) && raportFinanciar.pranimet_manuale.length > 0 ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Produkt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Depo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Furnitor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Sasia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {raportFinanciar.pranimet_manuale.map((pranim) => (
                      <tr key={pranim.transaksion_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(pranim.created_at).toLocaleDateString('sq-AL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pranim.produkt_emer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pranim.depo_emer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pranim.furnitor_emer || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                          {pranim.sasia_delta} njësi
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">📭 Nuk ka pranime manuale</p>
              <p className="text-gray-400 text-sm mt-2">Pranimet manuale të mallit do të shfaqen këtu</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



