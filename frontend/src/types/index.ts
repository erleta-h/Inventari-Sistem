export enum RoleName {
  ADMIN = 'ADMIN',
  MENAXHER = 'MENAXHER',
  MAGAZINIER = 'MAGAZINIER',
  SHITES = 'SHITES',
  SHOFER = 'SHOFER',
}

export interface Perdorues {
  id: number;
  emer: string;
  email: string;
  rolet: RoleName[];
}

export interface AuthResponse {
  token: string;
  perdorues: Perdorues;
}

export interface Klient {
  id: number;
  emer: string;
  tipi: 'PERSON' | 'KOMPANI';
  email?: string;
  telefoni?: string;
  adresa?: string;
  qyteti?: string;
  shteti?: string;
  is_active: boolean;
}

export interface Produkt {
  id: number;
  emer: string;
  sku: string;
  pershkrimi?: string;
  cmimi_njesi: number;
  stok_minimal_default: number;
  is_active: boolean;
}

export interface Depo {
  id: number;
  emer: string;
  kod: string;
  adresa?: string;
  kapaciteti?: number;
  status: 'AKTIV' | 'JOAKTIV';
}

export interface Inventar {
  id: number;
  depo_id: number;
  produkt_id: number;
  sasia: number;
  sasia_minimale: number;
  depo?: Depo;
  produkt?: Produkt;
}

export interface Porosi {
  id: number;
  klient_id: number;
  depo_id: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_SHIPPING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  total_amount: number;
  currency: string;
  adresa_dergeses?: string;
  qyteti?: string;
  shteti?: string;
  parapagesa?: number;
  shuma_paguar?: number;
  created_at?: string;
  klient?: Klient;
  depo?: Depo;
  artikujt?: ArtikullPorosie[];
}

export interface ArtikullPorosie {
  id: number;
  porosi_id: number;
  produkt_id: number;
  sasia: number;
  cmimi_njesi: number;
  line_total: number;
  produkt?: Produkt;
}

export interface Furnitor {
  id: number;
  emer: string;
  email?: string;
  telefoni?: string;
  adresa?: string;
  is_active: boolean;
}

export interface PorosiFurnizimi {
  id: number;
  furnitor_id: number;
  depo_id: number;
  status: string;
  data_pritjes?: string;
  data_pranimit?: string;
  furnitor?: Furnitor;
  depo?: Depo;
}

export interface Dergese {
  id: number;
  porosi_id: number;
  shofer_id?: number;
  mjet_id?: number;
  status: string;
  last_known_lat?: number;
  last_known_lng?: number;
  started_at?: string;
  delivered_at?: string;
  shofer?: Perdorues;
  mjet?: MjetTransportues;
  porosi?: Porosi;
}

export interface MjetTransportues {
  id: number;
  targa: string;
  modeli?: string;
  kapaciteti?: number;
  status: 'AKTIV' | 'NE_MIREMBAJTJE' | 'JO_DISPONUESHME';
  is_active: boolean;
}

export interface TransferDepo {
  id: number;
  produkt_id: number;
  from_depo_id: number;
  to_depo_id: number;
  sasia: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  created_by?: number | null;
  produkt?: Produkt;
  nga_depo?: Depo;
  te_depo?: Depo;
}

export interface Njoftim {
  id: number;
  perdorues_id?: number | null;
  tipi: 'LOW_STOCK' | 'DELIVERY_ALERT' | 'SYSTEM_ALERT';
  titulli: string;
  mesazhi: string;
  is_read: boolean;
  created_at: string;
}