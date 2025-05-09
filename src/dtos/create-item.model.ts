import {Model, model, property} from '@loopback/repository';

@model()
export class CreateItem extends Model {
  constructor(data?: Partial<CreateItem>) {
    super(data);
  }

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
}

export interface CreateItemRelations {
  // describe navigational properties here
}

export type CreateItemWithRelations = CreateItem & CreateItemRelations;
