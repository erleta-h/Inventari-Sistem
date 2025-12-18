import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum PorosiStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY_FOR_SHIPPING = "READY_FOR_SHIPPING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export class Porosi extends Model<
  InferAttributes<Porosi>,
  InferCreationAttributes<Porosi>
> {
  declare id: CreationOptional<number>;
  declare klient_id: number;
  declare depo_id: number;
  declare status: PorosiStatus;
  declare total_amount: number;
  declare currency: string;
  declare adresa_dergeses: string | null;
  declare qyteti: string | null;
  declare shteti: string | null;
  declare parapagesa: CreationOptional<number>;
  declare shuma_paguar: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
  declare created_by: number | null;
}

Porosi.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    klient_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "klientet",
        key: "id",
      },
    },
    depo_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "depot",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PorosiStatus)),
      allowNull: false,
      defaultValue: PorosiStatus.DRAFT,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "EUR",
    },
    adresa_dergeses: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qyteti: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shteti: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    parapagesa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    shuma_paguar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "porosite",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);