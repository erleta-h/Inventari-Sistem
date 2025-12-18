import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  BelongsToGetAssociationMixin,
} from "sequelize";
import { sequelize } from "../config/database";
import type { Porosi } from "./Porosi";
import type { Perdorues } from "./Perdorues";
import type { MjetTransportues } from "./MjetTransportues";

export enum DergeseStatus {
  PLANNED = "PLANNED",
  ON_THE_WAY = "ON_THE_WAY",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  RETURNED = "RETURNED",
}

export class Dergese extends Model<
  InferAttributes<Dergese>,
  InferCreationAttributes<Dergese>
> {
  declare id: CreationOptional<number>;
  declare porosi_id: number;
  declare shofer_id: number | null;
  declare mjet_id: number | null;
  declare status: DergeseStatus;
  declare arsye_deshtimi: string | null;
  declare started_at: Date | null;
  declare delivered_at: Date | null;
  declare last_known_lat: number | null;
  declare last_known_lng: number | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Asociacionet (typed) - krijohen kur përdoret `include` ose mixins
  declare porosi?: NonAttribute<Porosi>;
  declare shofer?: NonAttribute<Perdorues>;
  declare mjet?: NonAttribute<MjetTransportues>;

  declare getPorosi: BelongsToGetAssociationMixin<Porosi>;
  declare getShofer: BelongsToGetAssociationMixin<Perdorues>;
  declare getMjet: BelongsToGetAssociationMixin<MjetTransportues>;
}

Dergese.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    porosi_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "porosite",
        key: "id",
      },
    },
    shofer_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "perdoruesit",
        key: "id",
      },
    },
    mjet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "mjetet_transportuese",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DergeseStatus)),
      allowNull: false,
      defaultValue: DergeseStatus.PLANNED,
    },
    arsye_deshtimi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_known_lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    last_known_lng: {
      type: DataTypes.DECIMAL(11, 8),
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
    tableName: "dergesat",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);






