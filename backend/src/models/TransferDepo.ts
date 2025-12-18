import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export enum TransferStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class TransferDepo extends Model<
  InferAttributes<TransferDepo>,
  InferCreationAttributes<TransferDepo>
> {
  declare id: CreationOptional<number>;
  declare produkt_id: number;
  declare from_depo_id: number;
  declare to_depo_id: number;
  declare sasia: number;
  declare status: TransferStatus;
  declare created_at: CreationOptional<Date>;
  declare created_by: number | null;
}

TransferDepo.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    produkt_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "produktet",
        key: "id",
      },
    },
    from_depo_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "depot",
        key: "id",
      },
    },
    to_depo_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "depot",
        key: "id",
      },
    },
    sasia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransferStatus)),
      allowNull: false,
      defaultValue: TransferStatus.PENDING,
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
    tableName: "transferet_depove",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);