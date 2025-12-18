import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum RoleName {
  ADMIN = "ADMIN",
  MENAXHER = "MENAXHER",
  MAGAZINIER = "MAGAZINIER",
  SHITES = "SHITES",
  SHOFER = "SHOFER",
}

export class Rol extends Model<
  InferAttributes<Rol>,
  InferCreationAttributes<Rol>
> {
  declare id: CreationOptional<number>;
  declare name: RoleName;
  declare description: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Rol.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM(...Object.values(RoleName)),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "rolet",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

