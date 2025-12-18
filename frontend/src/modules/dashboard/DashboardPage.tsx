import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { useAuth } from '../../context/AuthContext';
import { RoleName, Dergese } from '../../types';
import { NotificationBell } from '../../components/layout/NotificationBell';


import { Porosi } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [dergesatAktive, setDergesatAktive] = useState<Dergese[]>([]);
  const [loading, setLoading] = useState(true);
  const [porositeShitesit, setPorositeShitesit] = useState<Porosi[]>([]);
  const [porositeTeGjitha, setPorositeTeGjitha] = useState<Porosi[]>([]);
  const [statistikat, setStatistikat] = useState({
    total: 0,
    konfirmuar: 0,
    nePergatitje: 0,
    gati: 0,
    dorezuar: 0,
    anuluar: 0,
    totalVlera: 0,
    totalPaguar: 0,
  });

  const isMenaxher = hasRole(RoleName.MENAXHER);
  const isAdmin = hasRole(RoleName.ADMIN);
  const isShofer = hasRole(RoleName.SHOFER);
  const isShites = hasRole(RoleName.SHITES);
  const isMagazinier = hasRole(RoleName.MAGAZINIER);
  const [pozicioniAktual, setPozicioniAktual] = useState<{ lat: number; lng: number } | null>(null);
  const [filterKlient, setFilterKlient] = useState<string>('');
  const [filterProdukt, setFilterProdukt] = useState<string>('');
  const [klientet, setKlientet] = useState<Array<{ id: number; emer: string }>>([]);
  const [produktet, setProduktet] = useState<Array<{ id: number; emer: string }>>([]);
  const [porositePergatitje, setPorositePergatitje] = useState<Porosi[]>([]);
  const [statistikatMagazinier, setStatistikatMagazinier] = useState({
    nePergatitje: 0,
    gati: 0,
    produktetMeStokMinimal: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: Promise<any>[] = [];

        // Nëse është shofer, merr dërgesat e tij për sot dhe pozicionin GPS
        if (isShofer) {
          // Dërgesat e shoferit për sot
          promises.push(
            apiClient.get<{ status: string; data: Dergese[] }>('/dergesat/shofer/me?vetem_sot=true').catch(() => ({ data: { status: 'success', data: [] } }))
          );

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
          }
        }

        // Nëse është menaxher ose admin, merr GPS tracking
        if (isMenaxher || isAdmin) {
          // Dërgesat aktive për GPS tracking
          promises.push(
            apiClient.get<{ status: string; data: Dergese[] }>('/dergesat').catch(() => ({ data: { status: 'success', data: [] } }))
          );
        }

        // Nëse është shitës, merr porositë e tij, klientët dhe produktet
        if (isShites && user?.id) {
          promises.push(
            apiClient.get<{ status: string; data: Porosi[] }>(`/porosite?perdorues_id=${user.id}`).catch(() => ({ data: { status: 'success', data: [] } }))
          );
          promises.push(
            apiClient.get<{ status: string; data: Array<{ id: number; emer: string }> }>('/klientet').catch(() => ({ data: { status: 'success', data: [] } }))
          );
          promises.push(
            apiClient.get<{ status: string; data: Array<{ id: number; emer: string }> }>('/produktet').catch(() => ({ data: { status: 'success', data: [] } }))
          );
        }

        // Nëse është magazinier, merr porositë që duhen përgatitur dhe produktet me stok minimal
        if (isMagazinier) {
          promises.push(
            apiClient.get<{ status: string; data: Porosi[] }>('/porosite').catch(() => ({ data: { status: 'success', data: [] } }))
          );
          promises.push(
            apiClient.get<{ status: string; data: Array<{ id: number; emer: string; sasia: number; sasia_minimale: number }> }>('/inventar/produkte-me-stok-minimal').catch(() => ({ data: { status: 'success', data: [] } }))
          );
        }

        const results = await Promise.all(promises);

        // Për shoferin
        if (isShofer) {
          const dergesatRes = results[0]?.data;
          const dergesatData = dergesatRes?.data || dergesatRes || [];
          const aktive = Array.isArray(dergesatData)
            ? dergesatData.map((d: any) => ({
                ...d,
                last_known_lat: d.last_known_lat ? parseFloat(d.last_known_lat) : null,
                last_known_lng: d.last_known_lng ? parseFloat(d.last_known_lng) : null,
              }))
            : [];
          setDergesatAktive(aktive);
        }

        if (isMenaxher || isAdmin) {
          // Dërgesat aktive për GPS tracking
          const dergesatRes = results[0]?.data;
          const dergesatData = dergesatRes?.data || dergesatRes || [];
          // Filtro vetëm dërgesat aktive (ON_THE_WAY ose PLANNED)
          const aktive = Array.isArray(dergesatData)
            ? dergesatData
                .filter((d: Dergese) => 
                  d.status === 'ON_THE_WAY' || d.status === 'PLANNED'
                )
                .map((d: any) => ({
                  ...d,
                  // Konverto koordinatat në number nëse janë string
                  last_known_lat: d.last_known_lat ? parseFloat(d.last_known_lat) : null,
                  last_known_lng: d.last_known_lng ? parseFloat(d.last_known_lng) : null,
                }))
            : [];
          setDergesatAktive(aktive);
        }

        if (isShites) {
          const indexOffset = (isMenaxher || isAdmin) ? 1 : 0;
          // Porositë e shitësit
          const porositeRes = results[indexOffset]?.data;
          const porositeData = porositeRes?.data || porositeRes || [];
          const porosite = Array.isArray(porositeData) ? porositeData : [];
          setPorositeTeGjitha(porosite);
          
          // Klientët
          const klientetRes = results[indexOffset + 1]?.data;
          const klientetData = klientetRes?.data || klientetRes || [];
          setKlientet(Array.isArray(klientetData) ? klientetData.map((k: any) => ({ id: k.id, emer: k.emer })) : []);
          
          // Produktet
          const produktetRes = results[indexOffset + 2]?.data;
          const produktetData = produktetRes?.data || produktetRes || [];
          setProduktet(Array.isArray(produktetData) ? produktetData.map((p: any) => ({ id: p.id, emer: p.emer })) : []);

          // Llogarit statistikat (pa filtrim)
          const stats = {
            total: porosite.length,
            konfirmuar: porosite.filter((p: Porosi) => p.status === 'CONFIRMED').length,
            nePergatitje: porosite.filter((p: Porosi) => p.status === 'PREPARING').length,
            gati: porosite.filter((p: Porosi) => p.status === 'READY_FOR_SHIPPING').length,
            dorezuar: porosite.filter((p: Porosi) => p.status === 'DELIVERED').length,
            anuluar: porosite.filter((p: Porosi) => p.status === 'CANCELLED').length,
            totalVlera: porosite.reduce((sum: number, p: Porosi) => sum + Number(p.total_amount || 0), 0),
            totalPaguar: porosite.reduce((sum: number, p: Porosi) => sum + Number(p.shuma_paguar || 0), 0),
          };
          setStatistikat(stats);
          
          // Apliko filtrat
          let porositeFiltruar = porosite;
          if (filterKlient) {
            porositeFiltruar = porositeFiltruar.filter((p: Porosi) => 
              p.klient?.emer?.toLowerCase().includes(filterKlient.toLowerCase())
            );
          }
          if (filterProdukt) {
            porositeFiltruar = porositeFiltruar.filter((p: Porosi) => 
              p.artikujt?.some((art: any) => 
                art.produkt?.emer?.toLowerCase().includes(filterProdukt.toLowerCase())
              )
            );
          }
          setPorositeShitesit(porositeFiltruar);
        }

        if (isMagazinier) {
          // Llogarit offset-in bazuar në rolet e tjera
          let indexOffset = 0;
          if (isMenaxher || isAdmin) indexOffset += 1;
          if (isShofer) indexOffset += 1;
          if (isShites) indexOffset += 3; // porosite, klientet, produktet
          
          // Porositë
          const porositeRes = results[indexOffset]?.data;
          const porositeData = porositeRes?.data || porositeRes || [];
          const porosite = Array.isArray(porositeData) ? porositeData : [];
          
          // Filtro porositë që duhen përgatitur (PREPARING) dhe që janë gati (READY_FOR_SHIPPING)
          const nePergatitje = porosite.filter((p: Porosi) => p.status === 'PREPARING');
          const gati = porosite.filter((p: Porosi) => p.status === 'READY_FOR_SHIPPING');
          setPorositePergatitje([...nePergatitje, ...gati]);
          
          // Produktet me stok minimal
          const produktetRes = results[indexOffset + 1]?.data;
          const produktetData = produktetRes?.data || produktetRes || [];
          const produktetMeStokMinimal = Array.isArray(produktetData) ? produktetData : [];
          
          setStatistikatMagazinier({
            nePergatitje: nePergatitje.length,
            gati: gati.length,
            produktetMeStokMinimal: produktetMeStokMinimal.length,
          });
        }
      } catch (error) {
        console.error('Gabim në marrjen e të dhënave:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh çdo 30 sekonda për GPS tracking
    const interval = setInterval(() => {
      if (isShofer) {
        apiClient.get<{ status: string; data: Dergese[] }>('/dergesat/shofer/me?vetem_sot=true')
          .then((res) => {
            const dergesatData = res.data.data || res.data || [];
            const aktive = Array.isArray(dergesatData)
              ? dergesatData.map((d: any) => ({
                  ...d,
                  last_known_lat: d.last_known_lat ? parseFloat(d.last_known_lat) : null,
                  last_known_lng: d.last_known_lng ? parseFloat(d.last_known_lng) : null,
                }))
              : [];
            setDergesatAktive(aktive);
          })
          .catch(() => {});
      } else if (isMenaxher || isAdmin) {
        // Vetëm dërgesat në kohë reale (ON_THE_WAY dhe PLANNED)
        apiClient.get<{ status: string; data: Dergese[] }>('/dergesat')
          .then((res) => {
            const dergesatData = res.data.data || res.data || [];
            const aktive = Array.isArray(dergesatData)
              ? dergesatData.filter((d: Dergese) => 
                  d.status === 'ON_THE_WAY' || d.status === 'PLANNED'
                )
              : [];
            setDergesatAktive(aktive);
          })
          .catch(() => {});
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isMenaxher, isAdmin, isShofer, isShites, isMagazinier, user?.id, filterKlient, filterProdukt]);

  // Apliko filtrat kur ndryshohen
  useEffect(() => {
    if (isShites && porositeTeGjitha.length > 0) {
      let porositeFiltruar = porositeTeGjitha;
      if (filterKlient) {
        porositeFiltruar = porositeFiltruar.filter((p: Porosi) => 
          p.klient?.emer?.toLowerCase().includes(filterKlient.toLowerCase())
        );
      }
      if (filterProdukt) {
        porositeFiltruar = porositeFiltruar.filter((p: Porosi) => 
          p.artikujt?.some((art: any) => 
            art.produkt?.emer?.toLowerCase().includes(filterProdukt.toLowerCase())
          )
        );
      }
      setPorositeShitesit(porositeFiltruar);
    }
  }, [filterKlient, filterProdukt, porositeTeGjitha, isShites]);


  if (loading) {
    return <div className="p-6">Duke ngarkuar...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Mirë se vini, {user?.emer}!</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      </div>

      {/* Dashboard për Shitësin */}
      {isShites && (
        <div className="space-y-6">
          {/* Statistikat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Total Porositë</h3>
              </div>
              <p className="text-3xl font-bold text-indigo-700">{statistikat.total}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 rounded-xl shadow-lg border-2 border-yellow-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-md">
                  <span className="text-2xl">⏳</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Në Pritje</h3>
              </div>
              <p className="text-3xl font-bold text-orange-700">
                {statistikat.konfirmuar + statistikat.nePergatitje + statistikat.gati}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl shadow-lg border-2 border-green-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Dorëzuar</h3>
              </div>
              <p className="text-3xl font-bold text-green-700">{statistikat.dorezuar}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl shadow-lg border-2 border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Total Vlerë</h3>
              </div>
              <p className="text-2xl font-bold text-purple-700">{statistikat.totalVlera.toFixed(2)} EUR</p>
              <p className="text-sm text-gray-600 mt-1">Paguar: {statistikat.totalPaguar.toFixed(2)} EUR</p>
            </div>
          </div>

          {/* Porositë e Fundit */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📦 Porositë e Mia</h2>
              <Link
                to="/porosite"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Shiko të gjitha →
              </Link>
            </div>
            
            {/* Filtrat */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Filtro sipas Klientit
                </label>
                <input
                  type="text"
                  placeholder="Shkruaj emrin e klientit..."
                  value={filterKlient}
                  onChange={(e) => setFilterKlient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Filtro sipas Produktit
                </label>
                <input
                  type="text"
                  placeholder="Shkruaj emrin e produktit..."
                  value={filterProdukt}
                  onChange={(e) => setFilterProdukt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {(filterKlient || filterProdukt) && (
              <div className="mb-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilterKlient('');
                    setFilterProdukt('');
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Fshi Filtrat
                </button>
                <span className="text-sm text-gray-600">
                  {porositeShitesit.length} porosi të gjetura
                </span>
              </div>
            )}
            {porositeShitesit.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg mb-2">📭 Nuk ka porosi</p>
                <Link
                  to="/porosite/krijo"
                  className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Krijo Porosi të Re
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {porositeShitesit.slice(0, 10).map((porosi) => (
                  <Link
                    key={porosi.id}
                    to={`/porosite/${porosi.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">Porosi #{porosi.id}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            porosi.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            porosi.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            porosi.status === 'READY_FOR_SHIPPING' ? 'bg-blue-100 text-blue-700' :
                            porosi.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {porosi.status === 'CONFIRMED' ? 'Konfirmuar' :
                             porosi.status === 'PREPARING' ? 'Në Përgatitje' :
                             porosi.status === 'READY_FOR_SHIPPING' ? 'Gati për Dërgesë' :
                             porosi.status === 'DELIVERED' ? 'Dorëzuar' :
                             porosi.status === 'CANCELLED' ? 'Anuluar' :
                             porosi.status}
                          </span>
                        </div>
                        {porosi.klient && (
                          <p className="text-sm text-gray-600">Klient: {porosi.klient.emer}</p>
                        )}
                        {porosi.depo && (
                          <p className="text-sm text-gray-600">Depo: {porosi.depo.emer}</p>
                        )}
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          Total: {Number(porosi.total_amount).toFixed(2)} EUR
                          {porosi.shuma_paguar && porosi.shuma_paguar > 0 && (
                            <span className="text-green-600 ml-2">
                              (Paguar: {Number(porosi.shuma_paguar).toFixed(2)} EUR)
                            </span>
                          )}
                        </p>
                        {porosi.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(porosi.created_at).toLocaleDateString('sq-AL')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard për Magazininierin */}
      {isMagazinier && (
        <div className="space-y-6">
          {/* Statistikat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 rounded-xl shadow-lg border-2 border-yellow-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-md">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Në Përgatitje</h3>
              </div>
              <p className="text-3xl font-bold text-orange-700">{statistikatMagazinier.nePergatitje}</p>
              <p className="text-sm text-gray-600 mt-1">Porositë që presin përgatitje</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl shadow-lg border-2 border-green-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Gati për Dërgesë</h3>
              </div>
              <p className="text-3xl font-bold text-green-700">{statistikatMagazinier.gati}</p>
              <p className="text-sm text-gray-600 mt-1">Porositë e përgatitura</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-xl shadow-lg border-2 border-red-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-md">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Stok Minimal</h3>
              </div>
              <p className="text-3xl font-bold text-red-700">{statistikatMagazinier.produktetMeStokMinimal}</p>
              <p className="text-sm text-gray-600 mt-1">Produkte që kanë nevojë për stok</p>
            </div>
          </div>

          {/* Porositë që duhen përgatitur */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📋 Porositë për Përgatitje</h2>
              <Link
                to="/porosite/pergatitje"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Shiko të gjitha →
              </Link>
            </div>
            {porositePergatitje.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">📭 Nuk ka porosi për përgatitje</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {porositePergatitje.slice(0, 10).map((porosi) => (
                  <Link
                    key={porosi.id}
                    to={`/porosite/${porosi.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">Porosi #{porosi.id}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            porosi.status === 'READY_FOR_SHIPPING' ? 'bg-green-100 text-green-700' :
                            porosi.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {porosi.status === 'PREPARING' ? 'Në Përgatitje' :
                             porosi.status === 'READY_FOR_SHIPPING' ? 'Gati për Dërgesë' :
                             porosi.status}
                          </span>
                        </div>
                        {porosi.klient && (
                          <p className="text-sm text-gray-600">Klient: {porosi.klient.emer}</p>
                        )}
                        {porosi.depo && (
                          <p className="text-sm text-gray-600">Depo: {porosi.depo.emer}</p>
                        )}
                        {porosi.artikujt && porosi.artikujt.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Artikuj: {porosi.artikujt.length} {porosi.artikujt.length === 1 ? 'artikull' : 'artikuj'}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          Total: {Number(porosi.total_amount).toFixed(2)} EUR
                        </p>
                        {porosi.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(porosi.created_at).toLocaleDateString('sq-AL')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dërgesat e Shoferit - Vetëm për SHOFER */}
      {isShofer && (
        <div className="mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🚚 Dërgesat e Mia për Sot</h2>
              <Link
                to="/dergesat/shofer"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Shiko të gjitha →
              </Link>
            </div>
            {dergesatAktive.length === 0 ? (
              <p className="text-gray-500 text-sm">Nuk ka dërgesa për sot</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dergesatAktive.map((dergesa) => (
                  <div
                    key={dergesa.id}
                    className="p-3 rounded border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          Dërgesa #{dergesa.id} - Porosi #{dergesa.porosi_id}
                        </p>
                        {dergesa.porosi?.klient && (
                          <p className="text-xs text-gray-600 mt-1">
                            Klient: {dergesa.porosi.klient.emer}
                          </p>
                        )}
                        {dergesa.mjet && (
                          <p className="text-xs text-gray-600">
                            Mjet: {dergesa.mjet.targa}
                          </p>
                        )}
                        {/* Destinacioni */}
                        {dergesa.porosi && (dergesa.porosi.adresa_dergeses || dergesa.porosi.qyteti) && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs font-semibold text-yellow-800 mb-1">🎯 Destinacioni:</p>
                            <p className="text-xs text-yellow-700">
                              {dergesa.porosi.adresa_dergeses && <span>{dergesa.porosi.adresa_dergeses}</span>}
                              {dergesa.porosi.qyteti && <span>, {dergesa.porosi.qyteti}</span>}
                              {dergesa.porosi.shteti && <span>, {dergesa.porosi.shteti}</span>}
                            </p>
                          </div>
                        )}
                        
                        {/* Seksioni i Dërgesës - Logjika e Biznesit */}
                        {(() => {
                          const kaPozicionGPS = pozicioniAktual != null;
                          const kaDestinacion = dergesa.porosi && (dergesa.porosi.adresa_dergeses || dergesa.porosi.qyteti);
                          const adresaDestinacion = kaDestinacion
                            ? `${dergesa.porosi!.adresa_dergeses || ''} ${dergesa.porosi!.qyteti || ''} ${dergesa.porosi!.shteti || ''}`.trim()
                            : '';

                          if (!kaDestinacion) {
                            return (
                              <p className="text-xs text-gray-400 italic mt-2">
                                ⚠️ Destinacioni nuk është i disponueshëm
                              </p>
                            );
                          }

                          return (
                            <div className="mt-2 space-y-2">
                              {/* 1. Destinacioni */}
                              <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-xs font-semibold text-yellow-900 mb-1">🎯 Destinacioni:</p>
                                <p className="text-xs text-yellow-800">{adresaDestinacion}</p>
                              </div>

                              {/* 2. Navigimi - Vetëm nëse dërgesa është në rrugë */}
                              {dergesa.status === 'ON_THE_WAY' && (
                                <div className="p-2 bg-indigo-50 rounded border border-indigo-200">
                                  <p className="text-xs font-semibold text-indigo-900 mb-1">🛣️ Navigimi:</p>
                                  {kaPozicionGPS ? (
                                    <a
                                      href={`https://www.openstreetmap.org/directions?from=${pozicioniAktual!.lat},${pozicioniAktual!.lng}&to=${encodeURIComponent(adresaDestinacion)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => {
                                        // Përditëso automatikisht GPS kur hap rrugën
                                        if (pozicioniAktual) {
                                          apiClient.put(`/dergesat/${dergesa.id}/pozicion`, {
                                            lat: pozicioniAktual.lat,
                                            lng: pozicioniAktual.lng,
                                          }).catch((err) => console.error('Gabim:', err));
                                        }
                                      }}
                                      className="block w-full bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 font-semibold text-center text-xs"
                                    >
                                      🗺️ Hap Hartën me Rrugën
                                    </a>
                                  ) : (
                                    <a
                                      href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(adresaDestinacion)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block w-full bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 font-semibold text-center text-xs"
                                    >
                                      🗺️ Shiko Destinacionin
                                    </a>
                                  )}
                                  <p className="text-xs text-indigo-700 mt-1">
                                    Menaxheri do të shohë automatikisht ku jeni
                                  </p>
                                </div>
                              )}

                              {/* 3. Konfirmimi - Vetëm nëse dërgesa është në rrugë */}
                              {dergesa.status === 'ON_THE_WAY' && (
                                <div className="p-2 bg-green-50 rounded border border-green-200">
                                  <p className="text-xs font-semibold text-green-900 mb-1">📦 Pas Dorëzimit:</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('A jeni të sigurt që malli u dorëzua me sukses?')) {
                                          try {
                                            await apiClient.put(`/dergesat/${dergesa.id}/status`, { status: 'DELIVERED' });
                                            const res = await apiClient.get<{ status: string; data: Dergese[] }>('/dergesat/shofer/me?vetem_sot=true');
                                            const dergesatData = res.data.data || res.data || [];
                                            const aktive = Array.isArray(dergesatData)
                                              ? dergesatData.map((d: any) => ({
                                                  ...d,
                                                  last_known_lat: d.last_known_lat ? parseFloat(d.last_known_lat) : null,
                                                  last_known_lng: d.last_known_lng ? parseFloat(d.last_known_lng) : null,
                                                }))
                                              : [];
                                            setDergesatAktive(aktive);
                                          } catch (err) {
                                            alert('Gabim në konfirmimin e dërgesës');
                                          }
                                        }
                                      }}
                                      className="bg-green-600 text-white px-2 py-1.5 rounded hover:bg-green-700 font-semibold text-xs"
                                    >
                                      ✅ U Dorëzua
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const arsye = window.prompt('Shkruani arsyen e dështimit:');
                                        if (arsye && arsye.trim()) {
                                          try {
                                            await apiClient.put(`/dergesat/${dergesa.id}/status`, {
                                              status: 'FAILED',
                                              arsye_deshtimi: arsye.trim(),
                                            });
                                            const res = await apiClient.get<{ status: string; data: Dergese[] }>('/dergesat/shofer/me?vetem_sot=true');
                                            const dergesatData = res.data.data || res.data || [];
                                            const aktive = Array.isArray(dergesatData)
                                              ? dergesatData.map((d: any) => ({
                                                  ...d,
                                                  last_known_lat: d.last_known_lat ? parseFloat(d.last_known_lat) : null,
                                                  last_known_lng: d.last_known_lng ? parseFloat(d.last_known_lng) : null,
                                                }))
                                              : [];
                                            setDergesatAktive(aktive);
                                          } catch (err) {
                                            alert('Gabim në konfirmimin e dërgesës');
                                          }
                                        }
                                      }}
                                      className="bg-red-600 text-white px-2 py-1.5 rounded hover:bg-red-700 font-semibold text-xs"
                                    >
                                      ❌ Dështoi
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 4. Statusi - Nëse dërgesa nuk është në rrugë */}
                              {dergesa.status !== 'ON_THE_WAY' && (
                                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                                  <p className="text-xs font-semibold text-gray-800 mb-1">Statusi:</p>
                                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                    dergesa.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                    dergesa.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                    dergesa.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {dergesa.status === 'DELIVERED' && '✅ U Dorëzua'}
                                    {dergesa.status === 'FAILED' && '❌ Dështoi'}
                                    {dergesa.status === 'PLANNED' && '📋 E Planifikuar'}
                                    {!['DELIVERED', 'FAILED', 'PLANNED'].includes(dergesa.status) && dergesa.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Harta e Mjeteve Aktive - Vetëm për MENAXHER dhe ADMIN */}
      {(isMenaxher || isAdmin) && dergesatAktive.length > 0 && (
        <div className="mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">🗺️ Gjurmim Real-Time i Mjeteve</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Shiko ku gjenden mjetet tuaja dhe ku po shkojnë në kohë reale
                </p>
              </div>
              <Link
                to="/dergesat"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Shiko të gjitha →
              </Link>
            </div>
            
            {/* Harta interaktive me link për zoom */}
            <div className="mb-4">
              {(() => {
                const dergesatMeGPS = dergesatAktive.filter(d => 
                  d.last_known_lat != null && d.last_known_lng != null &&
                  !isNaN(Number(d.last_known_lat)) && !isNaN(Number(d.last_known_lng))
                );
                
                if (dergesatMeGPS.length === 0) {
                  // Nëse nuk ka GPS, shfaq harta të përgjithshme me mesazh
                  return (
                    <div className="w-full h-96 rounded-lg border border-gray-300 relative bg-gray-50">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=20.0,41.0,21.0,43.0&layer=mapnik&marker=42.0,21.0"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-md">
                          <p className="text-gray-700 font-semibold mb-2">📍 Nuk ka mjete me GPS të përditësuar</p>
                          <p className="text-sm text-gray-600">Shoferët duhet të përditësojnë pozicionin GPS për të shfaqur mjetet në hartë</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Llogarit bounding box
                const lats = dergesatMeGPS.map(d => Number(d.last_known_lat!));
                const lngs = dergesatMeGPS.map(d => Number(d.last_known_lng!));
                
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);
                const centerLat = (minLat + maxLat) / 2;
                const centerLng = (minLng + maxLng) / 2;
                
                // Llogarit padding për bounding box - sigurohemi që të përfshijë të gjitha mjetet
                const latDiff = maxLat - minLat;
                const lngDiff = maxLng - minLng;
                const paddingLat = latDiff > 0 ? latDiff * 0.2 : 0.01;
                const paddingLng = lngDiff > 0 ? lngDiff * 0.2 : 0.01;
                const padding = Math.max(paddingLat, paddingLng, 0.01);

                // Krijo URL për OpenStreetMap me zoom interaktiv
                const mapUrl = `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}&zoom=13&layers=M`;

                // Krijo URL për harta të embeduar - përdorim bounding box që përfshin të gjitha mjetet
                const bbox = `${minLng - padding},${minLat - padding},${maxLng + padding},${maxLat + padding}`;
                const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${centerLat},${centerLng}`;

                return (
                  <div className="space-y-4">
                    {/* Harta e Embeduar me Pozicionet e Mjeteve */}
                    <div className="w-full h-96 rounded-lg border-2 border-indigo-400 overflow-hidden relative bg-white shadow-lg">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={embedUrl}
                        title="Harta e Mjeteve Aktive"
                        onError={(e) => {
                          console.error('Gabim në ngarkimin e hartës:', e);
                        }}
                      />
                      {/* Overlay me buton për zoom dhe informacion */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 text-sm font-semibold flex items-center gap-2 shadow-lg"
                        >
                          <span>🔍</span>
                          <span>Zoom Interaktiv</span>
                        </a>
                        <div className="bg-white/95 rounded px-3 py-2 shadow-lg text-xs border border-gray-200">
                          <p className="font-semibold text-gray-800">📍 {dergesatMeGPS.length} Mjet(e) Aktive</p>
                        </div>
                      </div>
                      {/* Legjenda me pozicionet e mjeteve */}
                      <div className="absolute bottom-2 left-2 bg-white/95 rounded px-3 py-2 shadow-lg text-xs border border-gray-200 max-w-xs">
                        <p className="font-semibold text-gray-800 mb-1">🚚 Mjetet:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {dergesatMeGPS.map((d) => (
                            <div key={d.id} className="text-gray-700">
                              <span className="font-medium">🚛 {d.mjet?.targa || 'N/A'}</span>
                              <span className="text-gray-500 ml-2">
                                ({Number(d.last_known_lat).toFixed(4)}, {Number(d.last_known_lng).toFixed(4)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lista e Mjeteve Aktive */}
                    <div className="w-full bg-white rounded-lg border border-gray-300 p-4">
                      <p className="text-sm font-semibold mb-3 text-gray-800">🚚 Mjetet Aktive ({dergesatMeGPS.length}):</p>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {dergesatMeGPS.map((dergesa) => {
                          const kaDestinacion = dergesa.porosi && (dergesa.porosi.adresa_dergeses || dergesa.porosi.qyteti);
                          const adresaDestinacion = kaDestinacion
                            ? `${dergesa.porosi!.adresa_dergeses || ''} ${dergesa.porosi!.qyteti || ''} ${dergesa.porosi!.shteti || ''}`.trim()
                            : '';
                          const lat = Number(dergesa.last_known_lat);
                          const lng = Number(dergesa.last_known_lng);

                          return (
                            <div key={dergesa.id} className="text-sm p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">
                                  🚛 {dergesa.mjet?.targa || 'N/A'}
                                </p>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  dergesa.status === 'ON_THE_WAY' ? 'bg-blue-100 text-blue-800' :
                                  dergesa.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {dergesa.status}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-1 text-xs">
                                👤 {dergesa.shofer?.emer || 'Pa shofer'}
                              </p>
                              {dergesa.porosi?.klient && (
                                <p className="text-gray-700 font-medium mb-1 text-xs">
                                  📦 → {dergesa.porosi.klient.emer}
                                </p>
                              )}
                              {kaDestinacion && (
                                <p className="text-gray-500 text-xs mb-2">
                                  🎯 {adresaDestinacion}
                                </p>
                              )}
                              <div className="text-xs text-gray-600 mb-2">
                                📍 Pozicioni: {lat.toFixed(6)}, {lng.toFixed(6)}
                              </div>
                              <p className="text-gray-400 text-xs mt-1">
                                Dërgesa #{dergesa.id}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

