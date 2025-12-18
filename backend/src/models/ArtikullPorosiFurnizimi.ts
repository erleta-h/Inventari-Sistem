import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export class ArtikullPorosiFurnizimi extends Model<
  InferAttributes<ArtikullPorosiFurnizimi>,
  InferCreationAttributes<ArtikullPorosiFurnizimi>
> {
  declare id: CreationOptional<number>;
  declare porosi_furnizimi_id: number;
  declare produkt_id: number;
  declare sasia_porositur: number;
  declare sasia_pranuar: number;
  declare cmimi_njesi: number;
}

ArtikullPorosiFurnizimi.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    porosi_furnizimi_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "porosi_furnizimi",
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
    sasia_porositur: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sasia_pranuar: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    cmimi_njesi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "artikujt_porosisefurnizimi",
    timestamps: false,
  }
);