import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';
import {inject} from '@loopback/core';
import {TodoService} from '../services';
import {CreateTodoWithItems} from '../dtos';

export class TodoControllerController {
  constructor(
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
    @inject('services.TodoService')
    public todoService: TodoService,
  ) {}

  @post('/todos')
  @response(200, {
    description: 'Todo model instance with items',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todo, {includeRelations: true}),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CreateTodoWithItems),
        },
      },
    })
    createTodoWithItems: CreateTodoWithItems,
  ): Promise<Todo> {
    return this.todoService.createTodoWithItems(createTodoWithItems);
  }

  @get('/todos/count')
  @response(200, {
    description: 'Todo model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Todo) where?: Where<Todo>): Promise<Count> {
    return this.todoRepository.count(where);
  }

  @get('/todos')
  @response(200, {
    description: 'Array of Todo model instances with pagination',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: getModelSchemaRef(Todo, {includeRelations: true}),
            },
            count: {type: 'number'},
            totalPages: {type: 'number'},
            currentPage: {type: 'number'},
          },
        },
      },
    },
  })
  async find(
    @param.filter(Todo) filter?: Filter<Todo>,
    @param.query.number('page') page?: number,
    @param.query.number('limit') limit?: number,
  ): Promise<{
    data: Todo[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    return this.todoService.getAllTodos(filter, page, limit);
  }

  @get('/todos/{id}')
  @response(200, {
    description: 'Todo model instance with items',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todo, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Todo, {exclude: 'where'}) filter?: FilterExcludingWhere<Todo>,
  ): Promise<Todo> {
    // 使用 TodoService 獲取 Todo 及其關聯的 Items
    return this.todoService.getTodoWithItems(id);
  }

  @patch('/todos/{id}')
  @response(204, {
    description: 'Todo PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Todo,
  ): Promise<void> {
    todo.updatedAt = new Date().toISOString();
    await this.todoRepository.updateById(id, todo);
  }

  @put('/todos/{id}')
  @response(204, {
    description: 'Todo PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<void> {
    todo.updatedAt = new Date().toISOString();
    await this.todoRepository.replaceById(id, todo);
  }

  @del('/todos/{id}')
  @response(204, {
    description: 'Todo DELETE success (soft delete)',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todoService.softDeleteTodo(id);
  }
}
