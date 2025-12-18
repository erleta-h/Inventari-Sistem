import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Porosi, Klient, Depo, Produkt, Inventar } from '../../types';

interface ArtikullForm {
  produkt_id: number;
  sasia: number;
}

interface StokInfo {
  stokuAktual: number;
  depoAlternative: Array<{ depo: Depo; sasia: number }>;
}

export const PorosiCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [klientet, setKlientet] = useState<Klient[]>([]);
  const [depot, setDepot] = useState<Depo[]>([]);
  const [produktet, setProduktet] = useState<Produkt[]>([]);
  const [inventari, setInventari] = useState<Inventar[]>([]);
  const [klientType, setKlientType] = useState<'ekzistues' | 'i_ri'>('ekzistues');
  const [klientSearch, setKlientSearch] = useState<string>('');
  const [klientetFiltruar, setKlientetFiltruar] = useState<Klient[]>([]);
  const [showKlientDropdown, setShowKlientDropdown] = useState(false);
  const klientDropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    klient_id: '',
    depo_id: '',
    adresa_dergeses: '',
    qyteti: '',
    shteti: '',
    parapagesa: '',
  });
  const [klientFormData, setKlientFormData] = useState({
    emer: '',
    tipi: 'PERSON' as 'PERSON' | 'KOMPANI',
    email: '',
    telefoni: '',
    adresa: '',
    qyteti: '',
    shteti: '',
    is_active: true,
  });
  const [artikujt, setArtikujt] = useState<ArtikullForm[]>([]);
  const [totali, setTotali] = useState<number>(0);
  const [stokInfo, setStokInfo] = useState<Record<number, StokInfo>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [klientetRes, depotRes, produktetRes, inventariRes] = await Promise.all([
          apiClient.get<{ status: string; data: Klient[] } | Klient[]>('/klientet'),
          apiClient.get<{ status: string; data: Depo[] } | Depo[]>('/depot'),
          apiClient.get<{ status: string; data: Produkt[] } | Produkt[]>('/produktet'),
          apiClient.get<{ status?: string; data?: Inventar[] } | Inventar[]>('/inventar'),
        ]);

        // Trajto klientët
        const klientetData = Array.isArray(klientetRes.data)
          ? klientetRes.data
          : (klientetRes.data as any)?.data || klientetRes.data || [];
        const klientetAktiv = Array.isArray(klientetData) ? klientetData.filter((k: Klient) => k.is_active) : [];
        setKlientet(klientetAktiv);
        setKlientetFiltruar(klientetAktiv);
        
        // Trajto depot
        const depotData = Array.isArray(depotRes.data)
          ? depotRes.data
          : (depotRes.data as any)?.data || depotRes.data || [];
        setDepot(Array.isArray(depotData) ? depotData : []);
        
        // Trajto produktet
        const produktetData = Array.isArray(produktetRes.data)
          ? produktetRes.data
          : (produktetRes.data as any)?.data || produktetRes.data || [];
        setProduktet(Array.isArray(produktetData) ? produktetData : []);
        
        // Trajto inventarin
        const inventariData = Array.isArray(inventariRes.data) 
          ? inventariRes.data 
          : (inventariRes.data as any)?.data || inventariRes.data || [];
        setInventari(Array.isArray(inventariData) ? inventariData : []);
        
        console.log('Klientët e marrë:', klientetData);
        console.log('Depot e marra:', depotData);
      } catch (err: any) {
        console.error('Gabim në marrjen e të dhënave:', err);
        setError(`Gabim në marrjen e të dhënave: ${err.response?.data?.message || err.message}`);
      }
    };
    fetchData();
  }, []);

  // Mbyll dropdown-in kur klikohet jashtë
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (klientDropdownRef.current && !klientDropdownRef.current.contains(event.target as Node)) {
        setShowKlientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddArtikull = () => {
    setArtikujt([...artikujt, { produkt_id: 0, sasia: 1 }]);
  };

  // Llogarit totalin kur ndryshohen produktet ose sasitë
  useEffect(() => {
    let total = 0;
    artikujt.forEach(artikull => {
      if (artikull.produkt_id > 0 && artikull.sasia > 0) {
        const produkt = produktet.find(p => p.id === artikull.produkt_id);
        if (produkt) {
          total += produkt.cmimi_njesi * artikull.sasia;
        }
      }
    });
    setTotali(total);
  }, [artikujt, produktet]);

  const handleRemoveArtikull = (index: number) => {
    setArtikujt(artikujt.filter((_, i) => i !== index));
  };

  const handleArtikullChange = (index: number, field: keyof ArtikullForm, value: number) => {
    const newArtikujt = [...artikujt];
    newArtikujt[index] = { ...newArtikujt[index], [field]: value };
    setArtikujt(newArtikujt);
    
    // Llogarit totalin
    let total = 0;
    newArtikujt.forEach(artikull => {
      if (artikull.produkt_id > 0 && artikull.sasia > 0) {
        const produkt = produktet.find(p => p.id === artikull.produkt_id);
        if (produkt) {
          total += produkt.cmimi_njesi * artikull.sasia;
        }
      }
    });
    setTotali(total);
    
    // Kontrollo stokun nëse ka produkt dhe depo
    if (field === 'produkt_id' && formData.depo_id) {
      kontrolloStokun(newArtikujt[index].produkt_id, Number(formData.depo_id), newArtikujt[index].sasia);
    } else if (field === 'sasia' && newArtikujt[index].produkt_id > 0 && formData.depo_id) {
      kontrolloStokun(newArtikujt[index].produkt_id, Number(formData.depo_id), value);
    }
  };

  // Kontrollo stokun dhe gjej depo alternative
  const kontrolloStokun = async (produktId: number, depoId: number, sasia: number) => {
    if (!produktId || !depoId || sasia <= 0) {
      return;
    }

    try {
      // Gjej stokun në depon e zgjedhur
      const inventarNeDepo = inventari.find(
        inv => inv.produkt_id === produktId && inv.depo_id === depoId
      );
      const stokuAktual = inventarNeDepo ? Number(inventarNeDepo.sasia) : 0;

      // Nëse nuk ka stok të mjaftueshëm, gjej depo alternative
      let depoAlternative: Array<{ depo: Depo; sasia: number }> = [];
      if (stokuAktual < sasia) {
        const response = await apiClient.get<{ status: string; data: Inventar[] }>(
          `/inventar/depo-me-stok?produkt_id=${produktId}&sasia=${sasia}`
        );
        const inventariMeStok = response.data.data || response.data;
        depoAlternative = inventariMeStok
          .filter((inv: Inventar) => inv.depo_id !== depoId && Number(inv.sasia) >= sasia)
          .map((inv: Inventar) => ({
            depo: inv.depo!,
            sasia: Number(inv.sasia),
          }));
      }

      setStokInfo(prev => ({
        ...prev,
        [produktId]: {
          stokuAktual,
          depoAlternative,
        },
      }));
    } catch (err) {
      console.error('Gabim në kontrollimin e stokut:', err);
    }
  };

  // Kur ndryshohet depo, kontrollo stokun për të gjitha artikujt
  useEffect(() => {
    if (formData.depo_id && artikujt.length > 0) {
      artikujt.forEach(artikull => {
        if (artikull.produkt_id > 0 && artikull.sasia > 0) {
          kontrolloStokun(artikull.produkt_id, Number(formData.depo_id), artikull.sasia);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.depo_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.depo_id) {
      setError('Depo është e detyrueshme');
      return;
    }

    if (klientType === 'ekzistues' && !formData.klient_id) {
      setError('Duhet të zgjidhni një klient');
      return;
    }

    if (klientType === 'i_ri') {
      if (!klientFormData.emer || !klientFormData.tipi) {
        setError('Emri dhe tipi i klientit janë të detyrueshme');
        return;
      }
    }

    if (artikujt.length === 0) {
      setError('Duhet të shtoni të paktën një artikull');
      return;
    }

    if (artikujt.some(a => a.produkt_id === 0 || a.sasia <= 0)) {
      setError('Të gjitha artikujt duhet të kenë produkt dhe sasi të vlefshme');
      return;
    }

    // Kontrollo stokun para submit
    const artikujtPaStok: string[] = [];
    for (const artikull of artikujt) {
      if (artikull.produkt_id > 0 && artikull.sasia > 0) {
        const info = stokInfo[artikull.produkt_id];
        if (!info || info.stokuAktual < artikull.sasia) {
          const produkt = produktet.find(p => p.id === artikull.produkt_id);
          const emerProdukt = produkt?.emer || 'Produkt i panjohur';
          const stokuAktual = info?.stokuAktual || 0;
          artikujtPaStok.push(`${emerProdukt} (Stoku aktual: ${stokuAktual}, Kërkuar: ${artikull.sasia})`);
        }
      }
    }

    if (artikujtPaStok.length > 0) {
      setError(`Stoku i pamjaftueshëm për produktet e mëposhtme:\n${artikujtPaStok.join('\n')}`);
      return;
    }

    setLoading(true);

    try {
      let klientId = Number(formData.klient_id);

      // Nëse është klient i ri, krijoje fillimisht
      if (klientType === 'i_ri') {
        const klientResponse = await apiClient.post<Klient>('/klientet', {
          emer: klientFormData.emer,
          tipi: klientFormData.tipi,
          email: klientFormData.email || null,
          telefoni: klientFormData.telefoni || null,
          adresa: klientFormData.adresa || null,
          qyteti: klientFormData.qyteti || null,
          shteti: klientFormData.shteti || null,
          is_active: klientFormData.is_active,
        });
        
        // Merr ID-në e klientit të ri
        if (klientResponse.data.id) {
          klientId = klientResponse.data.id;
        } else {
          throw new Error('Klienti u krijua por nuk u kthye ID');
        }
      }

      // Përgatit artikujt për dërgim
      const artikujtPerDergim = artikujt
        .filter(a => a.produkt_id > 0 && a.sasia > 0)
        .map(a => ({
          produkt_id: Number(a.produkt_id),
          sasia: Number(a.sasia),
        }));

      // Verifiko që ka artikuj të vlefshëm
      if (artikujtPerDergim.length === 0) {
        setError('Duhet të shtoni të paktën një artikull me produkt dhe sasi të vlefshme');
        setLoading(false);
        return;
      }

      // Validim parapagesa
      const parapagesa = formData.parapagesa ? Number(formData.parapagesa) : 0;
      if (parapagesa < 0 || parapagesa > totali) {
        setError(`Parapagesa duhet të jetë midis 0 dhe ${totali.toFixed(2)}`);
        setLoading(false);
        return;
      }

      // Krijo porosinë
      await apiClient.post<{ status: string; data: Porosi }>('/porosite', {
        klient_id: klientId,
        depo_id: Number(formData.depo_id),
        artikujt: artikujtPerDergim,
        adresa_dergeses: formData.adresa_dergeses || null,
        qyteti: formData.qyteti || null,
        shteti: formData.shteti || null,
        parapagesa: parapagesa > 0 ? parapagesa : undefined,
      });
      navigate('/porosite');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në krijimin e porosisë');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Krijo Porosi të Re</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-3">
              Zgjidh Klientin <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ekzistues"
                  checked={klientType === 'ekzistues'}
                  onChange={(e) => {
                    setKlientType(e.target.value as 'ekzistues' | 'i_ri');
                    setKlientSearch('');
                    setFormData({ ...formData, klient_id: '' });
                    setShowKlientDropdown(false);
                  }}
                  className="mr-2"
                />
                <span className="text-gray-700">Klient Ekzistues</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="i_ri"
                  checked={klientType === 'i_ri'}
                  onChange={(e) => {
                    setKlientType(e.target.value as 'ekzistues' | 'i_ri');
                    setKlientSearch('');
                    setFormData({ ...formData, klient_id: '' });
                    setShowKlientDropdown(false);
                  }}
                  className="mr-2"
                />
                <span className="text-gray-700">Klient i Ri</span>
              </label>
            </div>

            {klientType === 'ekzistues' ? (
              <div className="relative" ref={klientDropdownRef}>
                <input
                  type="text"
                  placeholder="Shkruaj emrin e klientit për të kërkuar..."
                  value={klientSearch}
                  onChange={(e) => {
                    const searchValue = e.target.value;
                    setKlientSearch(searchValue);
                    if (searchValue.trim()) {
                      const filtered = klientet.filter(k => 
                        k.emer.toLowerCase().includes(searchValue.toLowerCase())
                      );
                      setKlientetFiltruar(filtered);
                      setShowKlientDropdown(true);
                    } else {
                      setKlientetFiltruar(klientet);
                      setShowKlientDropdown(false);
                    }
                    // Nëse klienti zgjidhet nga dropdown, mos e fshi
                    if (!searchValue) {
                      setFormData({ ...formData, klient_id: '' });
                    }
                  }}
                  onFocus={() => {
                    if (klientSearch && klientetFiltruar.length > 0) {
                      setShowKlientDropdown(true);
                    } else if (klientet.length > 0) {
                      setKlientetFiltruar(klientet);
                      setShowKlientDropdown(true);
                    }
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {showKlientDropdown && klientetFiltruar.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {klientetFiltruar.map((klient) => (
                      <div
                        key={klient.id}
                        onClick={() => {
                          setKlientSearch(klient.emer);
                          setFormData({ ...formData, klient_id: String(klient.id) });
                          setShowKlientDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{klient.emer}</div>
                        {klient.email && (
                          <div className="text-sm text-gray-500">{klient.email}</div>
                        )}
                        {klient.telefoni && (
                          <div className="text-sm text-gray-500">{klient.telefoni}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {klientSearch && klientetFiltruar.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nuk u gjet klient me këtë emër. Zgjidh "Klient i Ri" për të krijuar një klient të ri.
                  </p>
                )}
                {!klientSearch && klientet.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nuk ka klientë në sistem. Zgjidh "Klient i Ri" për të krijuar një klient të ri.
                  </p>
                )}
                {formData.klient_id && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Klienti u zgjodh: {klientet.find(k => String(k.id) === formData.klient_id)?.emer}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-lg font-semibold mb-4">Të dhënat e Klientit të Ri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Emër <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={klientFormData.emer}
                      onChange={(e) => setKlientFormData({ ...klientFormData, emer: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tipi <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={klientFormData.tipi}
                      onChange={(e) => setKlientFormData({ ...klientFormData, tipi: e.target.value as 'PERSON' | 'KOMPANI' })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="PERSON">Person</option>
                      <option value="KOMPANI">Kompani</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                      type="email"
                      value={klientFormData.email}
                      onChange={(e) => setKlientFormData({ ...klientFormData, email: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Telefoni</label>
                    <input
                      type="tel"
                      value={klientFormData.telefoni}
                      onChange={(e) => setKlientFormData({ ...klientFormData, telefoni: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Adresa</label>
                    <input
                      type="text"
                      value={klientFormData.adresa}
                      onChange={(e) => setKlientFormData({ ...klientFormData, adresa: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Qyteti</label>
                    <input
                      type="text"
                      value={klientFormData.qyteti}
                      onChange={(e) => setKlientFormData({ ...klientFormData, qyteti: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Shteti</label>
                    <input
                      type="text"
                      value={klientFormData.shteti}
                      onChange={(e) => setKlientFormData({ ...klientFormData, shteti: e.target.value })}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Depo <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.depo_id}
                onChange={(e) => setFormData({ ...formData, depo_id: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Zgjidh Depon</option>
                {depot.filter(d => d.status === 'AKTIV').length > 0 ? (
                  depot.filter(d => d.status === 'AKTIV').map((depo) => (
                    <option key={depo.id} value={depo.id}>
                      {depo.emer}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nuk ka depot aktive në sistem</option>
                )}
              </select>
              {depot.filter(d => d.status === 'AKTIV').length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Nuk ka depot aktive në sistem. Kontaktoni administratorin.
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Artikujt</h2>
            {artikujt.map((artikull, index) => {
              const produkt = produktet.find(p => p.id === artikull.produkt_id);
              const info = stokInfo[artikull.produkt_id];
              const depoZgjedhur = depot.find(d => d.id === Number(formData.depo_id));
              const kaStok = info && info.stokuAktual >= artikull.sasia;
              const nukKaStok = info && info.stokuAktual < artikull.sasia;

              return (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Produkti</label>
                      <select
                        value={artikull.produkt_id}
                        onChange={(e) => handleArtikullChange(index, 'produkt_id', Number(e.target.value))}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="0">Zgjidh Produktin</option>
                        {produktet.filter(p => p.is_active).map((produkt) => (
                          <option key={produkt.id} value={produkt.id}>
                            {produkt.emer} - {produkt.cmimi_njesi} EUR
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Sasia</label>
                      <input
                        type="number"
                        min="1"
                        value={artikull.sasia}
                        onChange={(e) => handleArtikullChange(index, 'sasia', Number(e.target.value))}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArtikull(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Fshi
                    </button>
                  </div>
                  
                  {/* Informacion për stokun */}
                  {artikull.produkt_id > 0 && formData.depo_id && info && (
                    <div className="mt-3">
                      {kaStok ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
                          <strong>Stoku në {depoZgjedhur?.emer}:</strong> {info.stokuAktual} njësi (të mjaftueshme)
                        </div>
                      ) : nukKaStok ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                          <div className="mb-2">
                            <strong>Stoku i pamjaftueshëm në {depoZgjedhur?.emer}.</strong> Stoku aktual: {info.stokuAktual}, Kërkuar: {artikull.sasia}
                          </div>
                          {info.depoAlternative.length > 0 ? (
                            <div className="mt-2">
                              <strong>Produkti është i disponueshëm në depo të tjera:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {info.depoAlternative.map((alt, idx) => (
                                  <li key={idx}>
                                    {alt.depo.emer} - {alt.sasia} njësi
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="mt-2 text-red-600">
                              <strong>Produkti nuk është i disponueshëm në asnjë depo me sasinë e kërkuar.</strong>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddArtikull}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              + Shto Artikull
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Adresa e Dërgesës</label>
            <input
              type="text"
              value={formData.adresa_dergeses}
              onChange={(e) => setFormData({ ...formData, adresa_dergeses: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Qyteti</label>
              <input
                type="text"
                value={formData.qyteti}
                onChange={(e) => setFormData({ ...formData, qyteti: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Shteti</label>
              <input
                type="text"
                value={formData.shteti}
                onChange={(e) => setFormData({ ...formData, shteti: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-gray-700">Totali:</span>
              <span className="text-xl font-bold text-indigo-600">{totali.toFixed(2)} EUR</span>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Parapagesa (Opsional)
              </label>
              <input
                type="number"
                min="0"
                max={totali}
                step="0.01"
                value={formData.parapagesa}
                onChange={(e) => setFormData({ ...formData, parapagesa: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maksimumi: {totali.toFixed(2)} EUR
              </p>
            </div>
            {formData.parapagesa && Number(formData.parapagesa) > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Parapagesa:</strong> {Number(formData.parapagesa).toFixed(2)} EUR
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Mbetja:</strong> {(totali - Number(formData.parapagesa)).toFixed(2)} EUR
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/porosite')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Duke krijuar...' : 'Krijo Porosi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

