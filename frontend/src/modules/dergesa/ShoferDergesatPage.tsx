import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../../config/apiClient';
import { Dergese } from '../../types';

// CSS për animacione
const fadeInStyle = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

export const ShoferDergesatPage: React.FC = () => {
  const [dergesat, setDergesat] = useState<Dergese[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pozicioniAktual, setPozicioniAktual] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDergese, setSelectedDergese] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmType, setConfirmType] = useState<'DELIVERED' | 'FAILED' | null>(null);
  const [arsyeDeshtimi, setArsyeDeshtimi] = useState('');
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchDergesat = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: Dergese[] }>('/dergesat/shofer/me?vetem_sot=true');
        setDergesat(response.data.data || response.data);
      } catch (err) {
        console.error('Gabim në marrjen e dërgesave:', err);
        setError('Gabim në marrjen e dërgesave');
      } finally {
        setLoading(false);
      }
    };

    fetchDergesat();

    // Merr pozicionin aktual GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPozicioniAktual({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Gabim në marrjen e pozicionit:', err);
        }
      );

      // Ndiq pozicionin në kohë reale
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setPozicioniAktual({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Gabim në ndjekjen e pozicionit:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handlePerditesoPozicion = async (dergeseId: number) => {
    if (!pozicioniAktual) {
      setError('Pozicioni GPS nuk është i disponueshëm');
      return;
    }

    try {
      await apiClient.put(`/dergesat/${dergeseId}/pozicion`, {
        lat: pozicioniAktual.lat,
        lng: pozicioniAktual.lng,
      });

      // Refresh dërgesat
      const response = await apiClient.get<{ status: string; data: Dergese[] }>('/dergesat/shofer/me?vetem_sot=true');
      setDergesat(response.data.data || response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në përditësimin e pozicionit');
    }
  };

  const handlePerditesoStatus = async (dergeseId: number, status: string, arsyeDeshtimi?: string) => {
    try {
      await apiClient.put(`/dergesat/${dergeseId}/status`, {
        status,
        arsye_deshtimi: arsyeDeshtimi,
      });

      // Refresh dërgesat
      const response = await apiClient.get<{ status: string; data: Dergese[] }>('/dergesat/shofer/me?vetem_sot=true');
      setDergesat(response.data.data || response.data);
      setError('');
      setShowConfirmDialog(false);
      setConfirmType(null);
      setArsyeDeshtimi('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në përditësimin e statusit');
    }
  };

  const handleZgjedhDergese = (dergesa: Dergese) => {
    setSelectedDergese(dergesa.id);
  };

  const handleKonfirmoDergese = (type: 'DELIVERED' | 'FAILED') => {
    if (!selectedDergese) return;
    setConfirmType(type);
    setShowConfirmDialog(true);
  };

  const handleKonfirmoFinal = () => {
    if (!selectedDergese || !confirmType) return;
    
    if (confirmType === 'FAILED' && !arsyeDeshtimi.trim()) {
      setError('Ju lutem shkruani arsyen e dështimit');
      return;
    }

    handlePerditesoStatus(selectedDergese, confirmType, arsyeDeshtimi || undefined);
  };

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

  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <>
      <style>{fadeInStyle}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header me gradient */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🚚 Dërgesat e Mia për Sot
          </h1>
          <p className="text-gray-600">Menaxho dërgesat dhe gjurmo pozicionin GPS</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md animate-pulse">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Pozicioni aktual GPS - Card interaktive */}
        <div className="mb-6 p-5 bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <span className="text-2xl">📍</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Pozicioni Aktual GPS</h2>
          </div>
          {pozicioniAktual ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Latitude:</span>
                <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{pozicioniAktual.lat.toFixed(6)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Longitude:</span>
                <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{pozicioniAktual.lng.toFixed(6)}</span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${pozicioniAktual.lat},${pozicioniAktual.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>🗺️</span>
                <span>Shiko në Google Maps</span>
                <span>→</span>
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm">Duke marrë pozicionin GPS...</p>
            </div>
          )}
        </div>

        {/* Dërgesat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista e Dërgesave - Card moderne */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📦</span>
                  <span>Dërgesat e Mia</span>
                  <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-xs">
                    {dergesat.length}
                  </span>
                </h2>
              </div>
              {dergesat.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="text-6xl mb-3">📭</div>
                  <p className="text-gray-500 font-medium">Nuk keni dërgesa për sot</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {dergesat.map((dergesa) => (
                    <li
                      key={dergesa.id}
                      className={`px-4 py-4 cursor-pointer transition-all duration-200 ${
                        selectedDergese === dergesa.id 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 shadow-md' 
                          : 'hover:bg-gray-50 hover:shadow-sm'
                      }`}
                      onClick={() => handleZgjedhDergese(dergesa)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🚚</span>
                            <p className="text-sm font-bold text-gray-900">
                              Dërgesa #{dergesa.id}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            📋 Porosi #{dergesa.porosi_id}
                          </p>
                          <p className="text-xs text-gray-700 font-medium mb-2 flex items-center gap-1">
                            <span>👤</span>
                            <span>{dergesa.porosi?.klient?.emer || 'N/A'}</span>
                          </p>
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(dergesa.status)}`}>
                            {dergesa.status}
                          </span>
                        </div>
                        {selectedDergese === dergesa.id && (
                          <div className="text-indigo-600 animate-pulse">
                            <span className="text-xl">→</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Detajet e Dërgesës së Zgjedhur - Card interaktive */}
          <div className="lg:col-span-2">
            {selectedDergese ? (
              (() => {
                const dergesa = dergesat.find(d => d.id === selectedDergese);
                if (!dergesa) return null;

                const adresaDestinacion = dergesa.porosi 
                  ? `${dergesa.porosi.adresa_dergeses || ''} ${dergesa.porosi.qyteti || ''} ${dergesa.porosi.shteti || ''}`.trim()
                  : '';

                return (
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-5 border border-gray-100 animate-fadeIn">
                    {/* Header me gradient */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Dërgesa #{dergesa.id}</h2>
                          <p className="text-xs text-gray-500">Porosi #{dergesa.porosi_id}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-md ${getStatusColor(dergesa.status)}`}>
                        {dergesa.status}
                      </span>
                    </div>

                    {/* Informacioni i Dërgesës - Cards me gradient */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <span>📦</span>
                          <span>Porosi</span>
                        </p>
                        <p className="text-lg font-bold text-indigo-700">#{dergesa.porosi_id}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <span>👤</span>
                          <span>Klient</span>
                        </p>
                        <p className="text-lg font-bold text-purple-700">{dergesa.porosi?.klient?.emer || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <span>🚛</span>
                          <span>Mjet</span>
                        </p>
                        <p className="text-lg font-bold text-green-700">{dergesa.mjet?.targa || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-100 hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <span>📍</span>
                          <span>Pozicioni</span>
                        </p>
                        {pozicioniAktual ? (
                          <p className="text-xs font-mono text-orange-700 font-semibold">
                            {pozicioniAktual.lat.toFixed(4)}, {pozicioniAktual.lng.toFixed(4)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">Duke marrë pozicionin...</p>
                        )}
                      </div>
                    </div>

                  {/* Destinacioni */}
                  {adresaDestinacion && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">🎯 Destinacioni:</p>
                      <p className="text-sm text-yellow-900">{adresaDestinacion}</p>
                    </div>
                  )}

                    {/* Seksioni i Dërgesës - Logjika e Biznesit me design modern */}
                    {adresaDestinacion ? (
                      <div className="space-y-5">
                        {/* 1. Informacioni i Destinacionit - Card me gradient */}
                        <div className="p-5 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-md">
                              <span className="text-2xl">🎯</span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">Ku duhet të shkosh:</p>
                          </div>
                          <p className="text-base text-gray-800 font-semibold mb-2 bg-white/50 px-3 py-2 rounded-lg">{adresaDestinacion}</p>
                          {pozicioniAktual && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                              <span>📍</span>
                              <span className="font-mono">{pozicioniAktual.lat.toFixed(6)}, {pozicioniAktual.lng.toFixed(6)}</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Navigimi - Vetëm nëse dërgesa është në rrugë */}
                        {dergesa.status === 'ON_THE_WAY' && (
                          <div className="p-5 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl border-2 border-indigo-300 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                                <span className="text-2xl">🛣️</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">Navigimi</p>
                            </div>
                            <p className="text-sm text-gray-700 mb-4 bg-white/50 px-3 py-2 rounded-lg">
                              Kliko butonin më poshtë për të hapur hartën me rrugën nga pozicioni juaj te destinacioni. 
                              Menaxheri do të shohë automatikisht ku jeni.
                            </p>
                            {pozicioniAktual ? (
                              <a
                                href={`https://www.openstreetmap.org/directions?from=${pozicioniAktual.lat},${pozicioniAktual.lng}&to=${encodeURIComponent(adresaDestinacion)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  if (pozicioniAktual) {
                                    handlePerditesoPozicion(dergesa.id);
                                  }
                                }}
                                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-center flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                              >
                                <span className="text-2xl">🗺️</span>
                                <span>Hap Hartën me Rrugën për te Destinacioni</span>
                                <span className="text-xl">→</span>
                              </a>
                            ) : (
                              <div className="space-y-3">
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                  <p className="text-sm text-orange-700 font-semibold flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>GPS nuk është aktiv. Aktivizoni GPS në pajisjen tuaj për navigim.</span>
                                  </p>
                                </div>
                                <a
                                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(adresaDestinacion)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 font-bold text-center flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                                >
                                  <span className="text-2xl">🗺️</span>
                                  <span>Shiko Vetëm Destinacionin në Hartë</span>
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. Konfirmimi i Dërgesës - Vetëm nëse dërgesa është në rrugë */}
                        {dergesa.status === 'ON_THE_WAY' && (
                          <div className="p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl border-2 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                                <span className="text-2xl">📦</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">Pas Dorëzimit</p>
                            </div>
                            <p className="text-sm text-gray-700 mb-4 bg-white/50 px-3 py-2 rounded-lg">
                              Pasi të arrini te klienti dhe të dorëzoni mallin, klikoni butonin përkatës më poshtë:
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                onClick={() => handleKonfirmoDergese('DELIVERED')}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                              >
                                <span className="text-2xl">✅</span>
                                <span>Malli u Dorëzua</span>
                              </button>
                              <button
                                onClick={() => handleKonfirmoDergese('FAILED')}
                                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-pink-700 font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                              >
                                <span className="text-2xl">❌</span>
                                <span>Nuk u Dorëzua</span>
                              </button>
                            </div>
                            <div className="mt-4 p-3 bg-white/50 rounded-lg">
                              <p className="text-xs text-gray-600 text-center">
                                <strong className="text-green-700">✅ U Dorëzua:</strong> Klienti mori mallin me sukses<br/>
                                <strong className="text-red-700">❌ Nuk u Dorëzua:</strong> Ka pasur problem (klienti nuk ishte në shtëpi, adresa e gabuar, etj.)
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 4. Statusi Aktual - Nëse dërgesa nuk është në rrugë */}
                        {dergesa.status !== 'ON_THE_WAY' && (
                          <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-300 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg shadow-md">
                                <span className="text-2xl">📊</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">Statusi i Dërgesës</p>
                            </div>
                            <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg shadow-md ${getStatusColor(dergesa.status)}`}>
                              {dergesa.status === 'DELIVERED' && '✅ U Dorëzua me Sukses'}
                              {dergesa.status === 'FAILED' && '❌ Dështoi - Nuk u Dorëzua'}
                              {dergesa.status === 'PLANNED' && '📋 E Planifikuar - Duke Pritur Caktimin e Shoferit'}
                              {dergesa.status === 'RETURNED' && '↩️ U Kthye'}
                              {!['DELIVERED', 'FAILED', 'PLANNED', 'RETURNED'].includes(dergesa.status) && dergesa.status}
                            </div>
                            {dergesa.arsye_deshtimi && (
                              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                                  <span>⚠️</span>
                                  <span>Arsyeja e Dështimit:</span>
                                </p>
                                <p className="text-sm text-red-700">{dergesa.arsye_deshtimi}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-300 shadow-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⚠️</span>
                          <p className="text-sm font-semibold text-gray-700">Destinacioni nuk është i disponueshëm për këtë dërgesë.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-gray-100">
                <div className="text-8xl mb-4">👈</div>
                <p className="text-gray-600 text-lg font-semibold mb-2">Zgjidhni një dërgesë</p>
                <p className="text-gray-500 text-sm">Klikoni në një dërgesë nga lista për të parë detajet dhe rrugën</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog për Konfirmim */}
      {showConfirmDialog && confirmType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              {confirmType === 'DELIVERED' ? '✅ Konfirmo Dorëzimin' : '❌ Konfirmo Dështimin'}
            </h3>
            {confirmType === 'FAILED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arsyeja e Dështimit: *
                </label>
                <textarea
                  value={arsyeDeshtimi}
                  onChange={(e) => setArsyeDeshtimi(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Shkruani arsyen e dështimit..."
                />
              </div>
            )}
            {confirmType === 'DELIVERED' && (
              <p className="text-sm text-gray-600 mb-4">
                Jeni të sigurt që dërgesa u dorëzua me sukses?
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmType(null);
                  setArsyeDeshtimi('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Anulo
              </button>
              <button
                onClick={handleKonfirmoFinal}
                className={`px-4 py-2 text-white rounded ${
                  confirmType === 'DELIVERED' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Konfirmo
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

