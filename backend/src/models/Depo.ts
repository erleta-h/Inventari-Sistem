import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum DepoStatus {
  AKTIV = "AKTIV",
  JOAKTIV = "JOAKTIV",
}

export class Depo extends Model<
  InferAttributes<Depo>,
  InferCreationAttributes<Depo>
> {
  declare id: CreationOptional<number>;
  declare emer: string;
  declare kod: string;
  declare adresa: string | null;
  declare kapaciteti: number | null;
  declare status: DepoStatus;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

Depo.init(
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
    kod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    adresa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kapaciteti: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DepoStatus)),
      allowNull: false,
      defaultValue: DepoStatus.AKTIV,
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
    tableName: "depot",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);