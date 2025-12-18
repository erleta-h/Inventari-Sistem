import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export class PerdoruesRol extends Model<
  InferAttributes<PerdoruesRol>,
  InferCreationAttributes<PerdoruesRol>
> {
  declare id: CreationOptional<number>;
  declare perdorues_id: number;
  declare rol_id: number;
  declare created_at: CreationOptional<Date>;
}

PerdoruesRol.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    perdorues_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "perdoruesit",
        key: "id",
      },
    },
    rol_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "rolet",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "perdorues_rolet",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);






