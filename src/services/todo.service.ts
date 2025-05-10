import {injectable, /* inject, */ BindingScope, inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {Todo} from '../models';
import {TodoRepository, ItemRepository} from '../repositories';
import {HttpErrors} from '@loopback/rest';
import {CreateTodoWithItems} from '../dtos';
import {PaginatedResult, TodoStatus} from '../types';
import {PaginationService} from './pagination';

// 定義一個簡化的 Todo 類型，不包含 Entity 方法
interface TodoData {
  title: string;
  subtitle?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

@injectable({scope: BindingScope.TRANSIENT})
export class TodoService {
  constructor(
    @repository(TodoRepository)
    private todoRepository: TodoRepository,
    @repository(ItemRepository)
    private itemRepository: ItemRepository,
    @inject('services.PaginationService')
    private paginationService: PaginationService,
  ) {}

  /**
   * 創建一個 Todo 並同時創建多個 Item
   * @param todoWithItems - Todo 與 Items 的數據
   */
  async createTodoWithItems(todoWithItems: CreateTodoWithItems): Promise<Todo> {
    try {
      // 從輸入數據中提取 Todo 的部分
      const todoData: TodoData = {
        title: todoWithItems.title,
        subtitle: todoWithItems.subtitle,
        status: todoWithItems.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 創建 Todo
      const todo = await this.todoRepository.create(todoData);

      // 如果有 items，則為每個 item 創建記錄
      if (todoWithItems.items && todoWithItems.items.length > 0) {
        for (const itemData of todoWithItems.items) {
          const item = {
            ...itemData,
            todoId: todo.id!,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // 如果項目已完成，設置完成時間
            completedAt: itemData.isCompleted
              ? new Date().toISOString()
              : undefined,
          };
          await this.itemRepository.create(item);
        }
      }

      // 返回創建的 Todo，包括關聯的 Items
      return await this.todoRepository.findById(todo.id, {
        include: [{relation: 'items'}],
      });
    } catch (error) {
      // 處理錯誤
      throw new HttpErrors.InternalServerError('創建 Todo 和 Items 時出錯');
    }
  }

  /**
   * 軟刪除 Todo
   * @param id - Todo 的 ID
   */
  async softDeleteTodo(id: number): Promise<void> {
    try {
      const todo = await this.todoRepository.findById(id);

      if (!todo) {
        throw new HttpErrors.NotFound(`找不到 ID 為 ${id} 的 Todo`);
      }

      // 更新狀態為 DELETED 並設置刪除時間
      await this.todoRepository.updateById(id, {
        status: TodoStatus.DELETED,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new HttpErrors.InternalServerError(`軟刪除 Todo 時出錯`);
    }
  }

  /**
   * 根據 ID 獲取 Todo，包括其關聯 Items
   * @param id - Todo 的 ID
   */
  async getTodoWithItems(id: number): Promise<Todo> {
    try {
      return await this.todoRepository.findById(id, {
        include: [{relation: 'items'}],
      });
    } catch (error) {
      throw new HttpErrors.NotFound(`找不到 ID 為 ${id} 的 Todo`);
    }
  }

  /**
   * 獲取所有 Todo，支持分頁和過濾
   * @param filter - 過濾條件
   * @param page - 頁碼
   * @param limit - 每頁項目數
   */
  async getAllTodos(
    filter?: Filter<Todo>,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Todo>> {
    try {
      // 預設包含 items 關係
      const actualFilter = filter ?? {};
      if (!actualFilter.include) {
        actualFilter.include = [{relation: 'items'}];
      }

      // 使用通用分頁服務
      return await this.paginationService.paginate(
        (f) => this.todoRepository.find(f),
        (where) => this.todoRepository.count(where),
        actualFilter,
        page,
        limit
      );
    } catch (error) {
      throw new HttpErrors.InternalServerError('獲取所有 Todo 時出錯');
    }
  }
}
