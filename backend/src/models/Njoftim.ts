import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum NjoftimTipi {
  LOW_STOCK = "LOW_STOCK",
  DELIVERY_ALERT = "DELIVERY_ALERT",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}

export class Njoftim extends Model<
  InferAttributes<Njoftim>,
  InferCreationAttributes<Njoftim>
> {
  declare id: CreationOptional<number>;
  declare perdorues_id: number | null;
  declare tipi: NjoftimTipi;
  declare titulli: string;
  declare mesazhi: string;
  declare is_read: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
}

Njoftim.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    perdorues_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "perdoruesit",
        key: "id",
      },
    },
    tipi: {
      type: DataTypes.ENUM(...Object.values(NjoftimTipi)),
      allowNull: false,
    },
    titulli: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mesazhi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "njoftimet",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);






