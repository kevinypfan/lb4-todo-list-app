import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Item,
  Todo,
} from '../models';
import {ItemRepository} from '../repositories';

export class ItemTodoController {
  constructor(
    @repository(ItemRepository)
    public itemRepository: ItemRepository,
  ) { }

  @get('/items/{id}/todo', {
    responses: {
      '200': {
        description: 'Todo belonging to Item',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Todo),
          },
        },
      },
    },
  })
  async getTodo(
    @param.path.number('id') id: typeof Item.prototype.id,
  ): Promise<Todo> {
    return this.itemRepository.todo(id);
  }
}
