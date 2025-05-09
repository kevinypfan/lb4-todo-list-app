import {Model, model, property} from '@loopback/repository';

@model()
export class PaginatedResponse<T> extends Model {
  @property({
    type: 'number',
    required: true,
  })
  count: number;

  @property({
    type: 'number',
    required: true,
  })
  totalPages: number;

  @property({
    type: 'number',
    required: true,
  })
  currentPage: number;

  @property({
    type: 'array',
  })
  data?: Array<T>;

  constructor(data?: Partial<PaginatedResponse<T>>) {
    super(data);
  }
}
