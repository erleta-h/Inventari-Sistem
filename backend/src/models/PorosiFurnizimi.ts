import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum PorosiFurnizimiStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  ARRIVED = "ARRIVED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class PorosiFurnizimi extends Model<
  InferAttributes<PorosiFurnizimi>,
  InferCreationAttributes<PorosiFurnizimi>
> {
  declare id: CreationOptional<number>;
  declare furnitor_id: number;
  declare depo_id: number;
  declare status: PorosiFurnizimiStatus;
  declare data_pritjes: Date | null;
  declare data_pranimit: Date | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare created_by: number | null;
}

PorosiFurnizimi.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    furnitor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "furnitoret",
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
      type: DataTypes.ENUM(...Object.values(PorosiFurnizimiStatus)),
      allowNull: false,
      defaultValue: PorosiFurnizimiStatus.DRAFT,
    },
    data_pritjes: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_pranimit: {
      type: DataTypes.DATE,
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
    tableName: "porosi_furnizimi",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);







