import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum KlientTipi {
  PERSON = "PERSON",
  KOMPANI = "KOMPANI",
}

export class Klient extends Model<
  InferAttributes<Klient>,
  InferCreationAttributes<Klient>
> {
  declare id: CreationOptional<number>;
  declare emer: string;
  declare tipi: KlientTipi;
  declare email: string | null;
  declare telefoni: string | null;
  declare adresa: string | null;
  declare qyteti: string | null;
  declare shteti: string | null;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

Klient.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    emer: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipi: {
      type: DataTypes.ENUM(...Object.values(KlientTipi)),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefoni: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    adresa: {
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  },
  {
    sequelize,
    tableName: "klientet",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);






