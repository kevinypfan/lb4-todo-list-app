import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Todo} from './todo.model';

@model({
  name: 'items',
})
export class Item extends Entity {
  @property({
    name: 'id',
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    name: 'content',
    type: 'string',
    required: true,
  })
  content: string;

  @property({
    name: 'is_completed',
    type: 'boolean',
    required: true,
  })
  isCompleted: boolean;

  @property({
    name: 'completed_at',
    type: 'date',
  })
  completedAt?: string;

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

  @belongsTo(() => Todo)
  todoId: number;

  constructor(data?: Partial<Item>) {
    super(data);
  }
}

export interface ItemRelations {
  // describe navigational properties here
}

export type ItemWithRelations = Item & ItemRelations;
