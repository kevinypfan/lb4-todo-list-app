import {injectable, BindingScope} from '@loopback/core';
import {Count, Filter, Where} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {PaginatedResult} from '../../types';

@injectable({scope: BindingScope.TRANSIENT})
export class PaginationService {
  constructor() {}

  /**
   * 將輸入的過濾器轉換為包含分頁的過濾器
   * @param filter - 原始過濾器
   * @param page - 頁碼 (預設: 1)
   * @param limit - 每頁項目數 (預設: 10)
   */
  applyPagination<T extends object>(
    filter?: Filter<T>,
    page?: number,
    limit?: number,
  ): Filter<T> {
    const actualPage = page ?? 1;
    const actualLimit = limit ?? 10;
    const skip = (actualPage - 1) * actualLimit;

    // 構建過濾器
    const actualFilter = filter ?? {};
    actualFilter.skip = skip;
    actualFilter.limit = actualLimit;

    return actualFilter;
  }

  /**
   * 建立分頁結果物件
   * @param data - 結果數據
   * @param count - 總數
   * @param page - 當前頁碼
   * @param limit - 每頁項目數
   */
  createPaginatedResponse<T>(
    data: T[],
    count: number,
    page: number = 1,
    limit: number = 10,
  ): PaginatedResult<T> {
    return {
      data,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  /**
   * 執行帶分頁的查詢
   * @param findFn - 查詢函式，接受過濾器並返回數據
   * @param countFn - 計數函式，接受 where 條件並返回計數
   * @param filter - 過濾條件
   * @param page - 頁碼
   * @param limit - 每頁項目數
   */
  async paginate<T extends object>(
    findFn: (filter?: Filter<T>) => Promise<T[]>,
    countFn: (where?: Where<T>) => Promise<Count>,
    filter?: Filter<T>,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<T>> {
    try {
      const actualPage = page ?? 1;
      const actualLimit = limit ?? 10;
      
      // 應用分頁過濾器
      const paginatedFilter = this.applyPagination(filter, actualPage, actualLimit);
      
      // 執行查詢和計數
      const data = await findFn(paginatedFilter);
      const count = await countFn(paginatedFilter.where);
      
      // 建立分頁響應
      return this.createPaginatedResponse(data, count.count, actualPage, actualLimit);
    } catch (error) {
      throw new HttpErrors.InternalServerError('獲取分頁數據時出錯');
    }
  }
}
