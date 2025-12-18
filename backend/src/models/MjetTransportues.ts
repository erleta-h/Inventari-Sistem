import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum MjetStatus {
  AKTIV = "AKTIV",
  NE_MIREMBAJTJE = "NE_MIREMBAJTJE",
  JO_DISPONUESHME = "JO_DISPONUESHME",
}

export class MjetTransportues extends Model<
  InferAttributes<MjetTransportues>,
  InferCreationAttributes<MjetTransportues>
> {
  declare id: CreationOptional<number>;
  declare targa: string;
  declare modeli: string | null;
  declare kapaciteti: number | null;
  declare status: MjetStatus;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

MjetTransportues.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    targa: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    modeli: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    kapaciteti: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MjetStatus)),
      allowNull: false,
      defaultValue: MjetStatus.AKTIV,
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
    tableName: "mjetet_transportuese",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);