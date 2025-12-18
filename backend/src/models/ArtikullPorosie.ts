import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export class ArtikullPorosie extends Model<
  InferAttributes<ArtikullPorosie>,
  InferCreationAttributes<ArtikullPorosie>
> {
  declare id: CreationOptional<number>;
  declare porosi_id: number;
  declare produkt_id: number;
  declare sasia: number;
  declare cmimi_njesi: number;
  declare line_total: number;
}

ArtikullPorosie.init(
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
    produkt_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "produktet",
        key: "id",
      },
    },
    sasia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    cmimi_njesi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    line_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "artikujt_porosise",
    timestamps: false,
  }
);