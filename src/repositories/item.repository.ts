import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Item, ItemRelations, Todo} from '../models';
import {TodoRepository} from './todo.repository';

export class ItemRepository extends DefaultCrudRepository<
  Item,
  typeof Item.prototype.id,
  ItemRelations
> {

  public readonly todo: BelongsToAccessor<Todo, typeof Item.prototype.id>;

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource, @repository.getter('TodoRepository') protected todoRepositoryGetter: Getter<TodoRepository>,
  ) {
    super(Item, dataSource);
    this.todo = this.createBelongsToAccessorFor('todo', todoRepositoryGetter,);
    this.registerInclusionResolver('todo', this.todo.inclusionResolver);
  }
}
