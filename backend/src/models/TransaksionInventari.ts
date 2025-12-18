import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum TransaksionTipi {
  RECEIPT = "RECEIPT", // Pranim malli
  SALE = "SALE", // Shitje
  TRANSFER_IN = "TRANSFER_IN", // Transfer hyrje
  TRANSFER_OUT = "TRANSFER_OUT", // Transfer dalje
  ADJUSTMENT = "ADJUSTMENT", // Rregullim
}

export enum ReferenceType {
  ORDER = "ORDER",
  POROSI_FURNIZIMI = "POROSI_FURNIZIMI",
  TRANSFER = "TRANSFER",
  OTHER = "OTHER",
}

export class TransaksionInventari extends Model<
  InferAttributes<TransaksionInventari>,
  InferCreationAttributes<TransaksionInventari>
> {
  declare id: CreationOptional<number>;
  declare inventar_id: number;
  declare tipi: TransaksionTipi;
  declare sasia_delta: number;
  declare reference_type: ReferenceType | null;
  declare reference_id: number | null;
  declare created_at: CreationOptional<Date>;
  declare created_by: number | null;
}

TransaksionInventari.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    inventar_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "inventari",
        key: "id",
      },
    },
    tipi: {
      type: DataTypes.ENUM(...Object.values(TransaksionTipi)),
      allowNull: false,
    },
    sasia_delta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reference_type: {
      type: DataTypes.ENUM(...Object.values(ReferenceType)),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "perdoruesit",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "transaksionet_inventarit",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);