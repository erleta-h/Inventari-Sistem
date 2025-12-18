import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export class Perdorues extends Model<
  InferAttributes<Perdorues>,
  InferCreationAttributes<Perdorues>
> {
  declare id: CreationOptional<number>;
  declare emer: string;
  declare email: string;
  declare password_hash: string;
  declare telefoni: string | null;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

Perdorues.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefoni: {
      type: DataTypes.STRING(50),
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
    tableName: "perdoruesit",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);






