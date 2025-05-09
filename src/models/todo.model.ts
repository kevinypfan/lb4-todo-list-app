import {Entity, model, property, hasMany} from '@loopback/repository';
import {Item} from './item.model';
import {TodoStatus} from '../types';

@model({
  name: 'todos',
  settings: {
    scope: {
      where: {status: {neq: TodoStatus.DELETED}},
    },
  },
})
export class Todo extends Entity {
  @property({
    name: 'id',
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

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

  @property({
    name: 'created_at',
    type: 'date',
  })
  createdAt?: string;

  @property({
    name: 'updated_at',
    type: 'date',
  })
  updatedAt?: string;

  @property({
    name: 'deleted_at',
    type: 'date',
  })
  deletedAt?: string;

  @hasMany(() => Item, {keyTo: 'todoId'})
  items: Item[];

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  // describe navigational properties here
}

export type TodoWithRelations = Todo & TodoRelations;
