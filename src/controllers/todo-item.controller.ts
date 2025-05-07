import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Todo,
  Item,
} from '../models';
import {TodoRepository} from '../repositories';

export class TodoItemController {
  constructor(
    @repository(TodoRepository) protected todoRepository: TodoRepository,
  ) { }

  @get('/todos/{id}/items', {
    responses: {
      '200': {
        description: 'Array of Todo has many Item',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Item)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Item>,
  ): Promise<Item[]> {
    return this.todoRepository.items(id).find(filter);
  }

  @post('/todos/{id}/items', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Item)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Todo.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {
            title: 'NewItemInTodo',
            exclude: ['id'],
            optional: ['todoId']
          }),
        },
      },
    }) item: Omit<Item, 'id'>,
  ): Promise<Item> {
    return this.todoRepository.items(id).create(item);
  }

  @patch('/todos/{id}/items', {
    responses: {
      '200': {
        description: 'Todo.Item PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {partial: true}),
        },
      },
    })
    item: Partial<Item>,
    @param.query.object('where', getWhereSchemaFor(Item)) where?: Where<Item>,
  ): Promise<Count> {
    return this.todoRepository.items(id).patch(item, where);
  }

  @del('/todos/{id}/items', {
    responses: {
      '200': {
        description: 'Todo.Item DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Item)) where?: Where<Item>,
  ): Promise<Count> {
    return this.todoRepository.items(id).delete(where);
  }
}
