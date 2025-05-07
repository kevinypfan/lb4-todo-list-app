import {injectable, /* inject, */ BindingScope} from '@loopback/core';

@injectable({scope: BindingScope.TRANSIENT})
export class TodoService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  test() {
    console.log('test');
  }
}
