// Import sequelize para se të importohen modelet
import "../config/database";

// Import modelet (kjo do të ekzekutojë .init() për secilin model)
import { Perdorues } from "./Perdorues";
import { Rol } from "./Rol";
import { PerdoruesRol } from "./PerdoruesRol";
import { Klient } from "./Klient";
import { Furnitor } from "./Furnitor";
import { Produkt } from "./Produkt";
import { Depo } from "./Depo";
import { Inventar } from "./Inventar";
import { TransaksionInventari } from "./TransaksionInventari";
import { TransferDepo } from "./TransferDepo";
import { Porosi } from "./Porosi";
import { ArtikullPorosie } from "./ArtikullPorosie";
import { PorosiFurnizimi } from "./PorosiFurnizimi";
import { ArtikullPorosiFurnizimi } from "./ArtikullPorosiFurnizimi";
import { MjetTransportues } from "./MjetTransportues";
import { Dergese } from "./Dergese";
import { Njoftim } from "./Njoftim";
import { AuditLog } from "./AuditLog";

// Perdorues - Rol (Many-to-Many)
Perdorues.belongsToMany(Rol, {
  through: PerdoruesRol,
  foreignKey: "perdorues_id",
  otherKey: "rol_id",
  as: "rolet",
});

Rol.belongsToMany(Perdorues, {
  through: PerdoruesRol,
  foreignKey: "rol_id",
  otherKey: "perdorues_id",
  as: "perdoruesit",
});

// Porosi - Klient
Porosi.belongsTo(Klient, {
  foreignKey: "klient_id",
  as: "klient",
});

Klient.hasMany(Porosi, {
  foreignKey: "klient_id",
  as: "porosite",
});

// Porosi - Depo
Porosi.belongsTo(Depo, {
  foreignKey: "depo_id",
  as: "depo",
});

Depo.hasMany(Porosi, {
  foreignKey: "depo_id",
  as: "porosite",
});

// Porosi - ArtikullPorosie
Porosi.hasMany(ArtikullPorosie, {
  foreignKey: "porosi_id",
  as: "artikujt",
});

ArtikullPorosie.belongsTo(Porosi, {
  foreignKey: "porosi_id",
  as: "porosi",
});

// ArtikullPorosie - Produkt
ArtikullPorosie.belongsTo(Produkt, {
  foreignKey: "produkt_id",
  as: "produkt",
});

Produkt.hasMany(ArtikullPorosie, {
  foreignKey: "produkt_id",
  as: "artikujt_porosise",
});

// PorosiFurnizimi - Furnitor
PorosiFurnizimi.belongsTo(Furnitor, {
  foreignKey: "furnitor_id",
  as: "furnitor",
});

Furnitor.hasMany(PorosiFurnizimi, {
  foreignKey: "furnitor_id",
  as: "porosi_furnizimi",
});

// PorosiFurnizimi - Depo
PorosiFurnizimi.belongsTo(Depo, {
  foreignKey: "depo_id",
  as: "depo",
});

Depo.hasMany(PorosiFurnizimi, {
  foreignKey: "depo_id",
  as: "porosi_furnizimi",
});

// PorosiFurnizimi - ArtikullPorosiFurnizimi
PorosiFurnizimi.hasMany(ArtikullPorosiFurnizimi, {
  foreignKey: "porosi_furnizimi_id",
  as: "artikujt",
});

ArtikullPorosiFurnizimi.belongsTo(PorosiFurnizimi, {
  foreignKey: "porosi_furnizimi_id",
  as: "porosi_furnizimi",
});

// ArtikullPorosiFurnizimi - Produkt
ArtikullPorosiFurnizimi.belongsTo(Produkt, {
  foreignKey: "produkt_id",
  as: "produkt",
});

Produkt.hasMany(ArtikullPorosiFurnizimi, {
  foreignKey: "produkt_id",
  as: "artikujt_porosisefurnizimi",
});

// Inventar - Depo
Inventar.belongsTo(Depo, {
  foreignKey: "depo_id",
  as: "depo",
});

Depo.hasMany(Inventar, {
  foreignKey: "depo_id",
  as: "inventari",
});

// Inventar - Produkt
Inventar.belongsTo(Produkt, {
  foreignKey: "produkt_id",
  as: "produkt",
});

Produkt.hasMany(Inventar, {
  foreignKey: "produkt_id",
  as: "inventari",
});

// TransaksionInventari - Inventar
// Kontrollo nëse TransaksionInventari është inicializuar
if (!TransaksionInventari || typeof TransaksionInventari.belongsTo !== 'function') {
  throw new Error("TransaksionInventari nuk është inicializuar! Kontrollo nëse TransaksionInventari.init() është ekzekutuar.");
}

TransaksionInventari.belongsTo(Inventar, {
  foreignKey: "inventar_id",
  as: "inventar",
});

Inventar.hasMany(TransaksionInventari, {
  foreignKey: "inventar_id",
  as: "transaksionet",
});

// TransaksionInventari - Perdorues (created_by)
TransaksionInventari.belongsTo(Perdorues, {
  foreignKey: "created_by",
  as: "krijuar_nga",
});

Perdorues.hasMany(TransaksionInventari, {
  foreignKey: "created_by",
  as: "transaksionet",
});

// TransferDepo - Produkt
TransferDepo.belongsTo(Produkt, {
  foreignKey: "produkt_id",
  as: "produkt",
});

Produkt.hasMany(TransferDepo, {
  foreignKey: "produkt_id",
  as: "transferet",
});

// TransferDepo - Depo (from)
TransferDepo.belongsTo(Depo, {
  foreignKey: "from_depo_id",
  as: "nga_depo",
});

// TransferDepo - Depo (to)
TransferDepo.belongsTo(Depo, {
  foreignKey: "to_depo_id",
  as: "te_depo",
});

// TransferDepo - Perdorues (created_by)
TransferDepo.belongsTo(Perdorues, {
  foreignKey: "created_by",
  as: "krijuar_nga",
});

Perdorues.hasMany(TransferDepo, {
  foreignKey: "created_by",
  as: "transferet",
});

// Dergese - Porosi
Dergese.belongsTo(Porosi, {
  foreignKey: "porosi_id",
  as: "porosi",
});

Porosi.hasOne(Dergese, {
  foreignKey: "porosi_id",
  as: "dergesa",
});

// Dergese - Perdorues (shofer)
Dergese.belongsTo(Perdorues, {
  foreignKey: "shofer_id",
  as: "shofer",
});

Perdorues.hasMany(Dergese, {
  foreignKey: "shofer_id",
  as: "dergesat",
});

// Dergese - MjetTransportues
Dergese.belongsTo(MjetTransportues, {
  foreignKey: "mjet_id",
  as: "mjet",
});

MjetTransportues.hasMany(Dergese, {
  foreignKey: "mjet_id",
  as: "dergesat",
});

// Porosi - Perdorues (created_by)
Porosi.belongsTo(Perdorues, {
  foreignKey: "created_by",
  as: "krijuar_nga",
});

Perdorues.hasMany(Porosi, {
  foreignKey: "created_by",
  as: "porosite_krijuar",
});

// PorosiFurnizimi - Perdorues (created_by)
PorosiFurnizimi.belongsTo(Perdorues, {
  foreignKey: "created_by",
  as: "krijuar_nga",
});

Perdorues.hasMany(PorosiFurnizimi, {
  foreignKey: "created_by",
  as: "porosi_furnizimi_krijuar",
});

// Njoftim - Perdorues
Njoftim.belongsTo(Perdorues, {
  foreignKey: "perdorues_id",
  as: "perdorues",
});

Perdorues.hasMany(Njoftim, {
  foreignKey: "perdorues_id",
  as: "njoftimet",
});

// AuditLog - Perdorues
AuditLog.belongsTo(Perdorues, {
  foreignKey: "perdorues_id",
  as: "perdorues",
});

Perdorues.hasMany(AuditLog, {
  foreignKey: "perdorues_id",
  as: "audit_logs",
});

export {
  Perdorues,
  Rol,
  PerdoruesRol,
  Klient,
  Furnitor,
  Produkt,
  Depo,
  Inventar,
  TransaksionInventari,
  TransferDepo,
  Porosi,
  ArtikullPorosie,
  PorosiFurnizimi,
  ArtikullPorosiFurnizimi,
  MjetTransportues,
  Dergese,
  Njoftim,
  AuditLog,
};

