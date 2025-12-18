import { Model, ModelStatic, FindOptions, WhereOptions } from "sequelize";

export abstract class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async gjejTeGjitha(options?: FindOptions): Promise<T[]> {
    return await this.model.findAll(options);
  }

  async gjejNgaId(id: number, options?: FindOptions): Promise<T | null> {
    return await this.model.findByPk(id, options);
  }

  async krijim(data: any): Promise<T> {
    return await this.model.create(data);
  }

  async perditesim(id: number, data: any): Promise<[number, T[]]> {
    const [affectedCount, updated] = await this.model.update(data, {
      where: { id } as WhereOptions,
      returning: true,
    });
    return [affectedCount, updated as T[]];
  }

  async fshirje(id: number): Promise<number> {
    return await this.model.destroy({
      where: { id } as WhereOptions,
    });
  }

  async gjejNgaKusht(where: WhereOptions, options?: FindOptions): Promise<T | null> {
    return await this.model.findOne({ where, ...options });
  }
}






