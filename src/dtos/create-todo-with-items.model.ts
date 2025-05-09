import {Model, model, property} from '@loopback/repository';
import {TodoStatus} from '../types';
import {CreateItem} from './create-item.model';

@model()
export class CreateTodoWithItems extends Model {
  constructor(data?: Partial<CreateTodoWithItems>) {
    super(data);
  }

  @property({
    name: 'title',
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    name: 'subtitle',
    type: 'string',
  })
  subtitle?: string;

  @property({
    name: 'status',
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(TodoStatus),
    },
  })
  status: string;

  @property.array(CreateItem)
  items: Array<CreateItem>;
}

export interface CreateTodoWithItemsRelations {
  // describe navigational properties here
}

export type CreateTodoWithItemsWithRelations = CreateTodoWithItems &
  CreateTodoWithItemsRelations;
