import { FindOptionsOrder, FindOptionsSelect, FindOptionsSelectByString, FindOptionsWhere, Repository } from "typeorm";
import { PageDto } from "../dto/page.dto";
import { PageOutput } from "../output/page.output";

class PageHelper {
  /**
   * @description: 是否具备更多分页
   * @param {number} skip
   * @param {number} take
   * @param {number} total
   * @return {*}
   */
  hasNextPage(skip: number, take: number, total: number): boolean {
    return skip * take < total;
  }

  /**
   * @description: 构建分页数据
   * @param {Repository<T>} repository
   * @param {PageDto} pageDto
   * @return {*}
   */
  async buildPage<T, Tdto extends PageDto>(
    repository: Repository<T>,
    pageDto: Tdto,
    input?: {
      cover?: boolean;
      format?: (val: T[]) => Promise<T[]>;
      where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
      order?: FindOptionsOrder<T>;
      select?: FindOptionsSelect<T> | FindOptionsSelectByString<T>;
    }
  ): Promise<PageOutput<T>> {
    const { page: skip, pageSize: take, where: _where = {}, order: _order = {} } = pageDto || ({} as any);

    const select = (input || {}).select;
    const cover = (input || {}).cover;
    const inputWhere = (input || {}).where;
    const inputOrder = (input || {}).order;
    const where = cover ? inputWhere : { ..._where, ...inputWhere };
    const order = cover ? inputOrder : { ..._order, ...inputOrder };

    const [list, totalCount] = await repository.findAndCount({
      order,
      where,
      take,
      select,
      skip: (skip - 1) * take
    });

    const items = input?.format ? await input?.format(list) : list;
    return { items, totalCount, hasNextPage: this.hasNextPage(skip, take, totalCount) };
  }
}

export const pageHelper = new PageHelper();
