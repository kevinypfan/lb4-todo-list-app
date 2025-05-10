import {expect, Client} from '@loopback/testlab';
import {TodoListApplication} from '../..';
import {setupApplication} from '../acceptance/test-helper';
import {TodoRepository, ItemRepository} from '../../repositories';
import {Item} from '../../models';
import {TodoStatus} from '../../types';

describe('API 集成測試', () => {
  let app: TodoListApplication;
  let client: Client;
  let todoRepository: TodoRepository;
  let itemRepository: ItemRepository;
  let todoId: number;

  before(async function () {
    ({app, client} = await setupApplication());
    todoRepository = await app.getRepository(TodoRepository);
    itemRepository = await app.getRepository(ItemRepository);
  });

  beforeEach(async function () {
    // 清理測試數據（使用 SQL 直接清除資料表）
    await todoRepository.dataSource.execute('DELETE FROM todos');
    await itemRepository.dataSource.execute('DELETE FROM items');

    // 設置初始測試數據
    const todo = await todoRepository.create({
      title: '測試 Todo',
      subtitle: '測試副標題',
      status: TodoStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    todoId = todo.id!;

    await itemRepository.create({
      content: '測試 Item 1',
      isCompleted: false,
      todoId: todoId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  after(async function () {
    // 清理測試數據（使用 SQL 直接清除資料表）
    await todoRepository.dataSource.execute('DELETE FROM todos');
    await itemRepository.dataSource.execute('DELETE FROM items');
    await app.stop();
  });

  describe('Todo API 工作流測試', () => {
    it('應該完成完整 Todo 生命週期：創建 -> 讀取 -> 更新 -> 刪除', async () => {
      // 步驟 1：創建新 Todo 和 Items
      const newTodoData = {
        title: '新 Todo',
        subtitle: '新副標題',
        status: TodoStatus.ACTIVE,
        items: [
          {
            content: '項目 1',
            isCompleted: false,
          },
          {
            content: '項目 2',
            isCompleted: true,
          },
        ],
      };

      // 創建 Todo
      const createResponse = await client
        .post('/todos')
        .send(newTodoData)
        .expect(200);

      const createdTodo = createResponse.body;
      expect(createdTodo.title).to.equal(newTodoData.title);
      expect(createdTodo.subtitle).to.equal(newTodoData.subtitle);
      expect(createdTodo.items).to.have.lengthOf(2);

      // 步驟 2：讀取已創建的 Todo
      const getResponse = await client
        .get(`/todos/${createdTodo.id}`)
        .expect(200);

      expect(getResponse.body.id).to.equal(createdTodo.id);
      expect(getResponse.body.title).to.equal(newTodoData.title);
      expect(getResponse.body.items).to.have.lengthOf(2);

      // 步驟 3：更新 Todo
      const updateData = {
        title: '更新的 Todo',
        subtitle: '更新的副標題',
      };

      await client
        .patch(`/todos/${createdTodo.id}`)
        .send(updateData)
        .expect(204);

      // 驗證更新
      const updatedResponse = await client
        .get(`/todos/${createdTodo.id}`)
        .expect(200);

      expect(updatedResponse.body.title).to.equal(updateData.title);
      expect(updatedResponse.body.subtitle).to.equal(updateData.subtitle);

      // 步驟 4：刪除 Todo
      await client.del(`/todos/${createdTodo.id}`).expect(204);

      // 驗證軟刪除
      // 需要可以查詢到軟刪除的 Todo，所以直接使用底層資料庫查詢
      const deletedTodo = await todoRepository.dataSource.execute(
        'SELECT * FROM todos WHERE id = ?',
        [createdTodo.id],
      );

      expect(deletedTodo).to.not.be.empty();
      expect(deletedTodo[0].status).to.equal(TodoStatus.DELETED);
      expect(deletedTodo[0].deleted_at).to.not.be.null();

      // 確認使用 API 不再能找到此 Todo
      await client.get(`/todos/${createdTodo.id}`).expect(404);
    });

    it('應該支持 Todo 分頁和過濾', async () => {
      // 創建多個 Todo 以測試分頁
      const todoData = [
        {
          title: 'Todo 1',
          status: TodoStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: 'Todo 2',
          status: TodoStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: 'Todo 3',
          status: TodoStatus.INACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      await todoRepository.createAll(todoData);

      // 測試基本分頁
      const pageResponse = await client
        .get('/todos?page=1&limit=2')
        .expect(200);

      expect(pageResponse.body.data).to.have.lengthOf(2);
      expect(pageResponse.body.totalPages).to.be.equal(2);
      expect(pageResponse.body.currentPage).to.equal(1);

      // 測試過濾（根據狀態）
      const filterResponse = await client
        .get('/todos?filter[where][status]=INACTIVE')
        .expect(200);

      expect(filterResponse.body.data).to.have.lengthOf(1);
      expect(filterResponse.body.data[0].status).to.equal(TodoStatus.INACTIVE);
    });
  });

  describe('Item API 工作流測試', () => {
    it('應該完成完整 Item 生命週期：創建 -> 讀取 -> 更新 -> 刪除', async () => {
      // 步驟 1：創建新 Item
      const newItemData = {
        content: '新測試項目',
        isCompleted: false,
      };

      const createResponse = await client
        .post(`/todos/${todoId}/items`)
        .send(newItemData)
        .expect(200);

      const createdItem = createResponse.body;
      expect(createdItem.content).to.equal(newItemData.content);
      expect(createdItem.isCompleted).to.equal(newItemData.isCompleted);
      expect(createdItem.todoId).to.equal(todoId);

      // 步驟 2：讀取 Items
      const getResponse = await client
        .get(`/todos/${todoId}/items`)
        .expect(200);

      // 應該有兩個項目（測試初始化時的一個 + 剛創建的一個）
      expect(getResponse.body).to.have.lengthOf(2);
      const newItem = getResponse.body.find(
        (item: Item) => item.id === createdItem.id,
      );
      expect(newItem).to.not.be.undefined();
      expect(newItem.content).to.equal(newItemData.content);

      // 步驟 3：更新 Item
      const updateData = {
        content: '更新的項目',
        isCompleted: true,
      };

      await client
        .patch(`/todos/${todoId}/items`)
        .query({where: {id: createdItem.id}})
        .send(updateData)
        .expect(200);

      // 驗證更新
      const updatedResponse = await client
        .get(`/todos/${todoId}/items`)
        .query({filter: {where: {id: createdItem.id}}})
        .expect(200);

      expect(updatedResponse.body[0].content).to.equal(updateData.content);
      expect(updatedResponse.body[0].isCompleted).to.equal(
        updateData.isCompleted,
      );
      expect(updatedResponse.body[0].completedAt).to.not.be.undefined();

      // 步驟 4：刪除 Item
      await client
        .del(`/todos/${todoId}/items`)
        .query({where: {id: createdItem.id}})
        .expect(200);

      // 驗證刪除（硬刪除）
      const itemsAfterDelete = await itemRepository.find({
        where: {id: createdItem.id},
      });
      expect(itemsAfterDelete).to.have.lengthOf(0);
    });

    it('應該支持 Item 過濾', async () => {
      // 創建多個 Items 以測試過濾
      await itemRepository.createAll([
        {
          content: '完成的項目',
          isCompleted: true,
          completedAt: new Date().toISOString(),
          todoId: todoId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          content: '未完成的項目',
          isCompleted: false,
          todoId: todoId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // 測試過濾已完成項目
      const completedResponse = await client
        .get(`/todos/${todoId}/items`)
        .query({filter: {where: {isCompleted: true}}})
        .expect(200);

      expect(completedResponse.body).to.have.lengthOf(1);
      expect(completedResponse.body[0].isCompleted).to.be.true();
      expect(completedResponse.body[0].content).to.equal('完成的項目');

      // 測試過濾未完成項目
      const incompleteResponse = await client
        .get(`/todos/${todoId}/items`)
        .query({filter: {where: {isCompleted: false}}})
        .expect(200);

      // 應該有兩個項目（初始化時的一個 + 剛創建的一個）
      expect(incompleteResponse.body).to.have.lengthOf(2);
      expect(incompleteResponse.body[0].isCompleted).to.be.false();
    });
  });

  describe('Todo 和 Item 關聯操作測試', () => {
    it('應該在獲取單一 Todo 時包含其關聯的 Items', async () => {
      // 先為 todoId 創建多個 Item
      await itemRepository.createAll([
        {
          content: '關聯項目 1',
          isCompleted: false,
          todoId: todoId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          content: '關聯項目 2',
          isCompleted: true,
          completedAt: new Date().toISOString(),
          todoId: todoId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // 獲取 Todo 及其 Items
      const response = await client.get(`/todos/${todoId}`).expect(200);

      expect(response.body.id).to.equal(todoId);
      expect(response.body.items).to.have.lengthOf(3); // 初始化的1個 + 新建的2個
      expect(response.body.items.map((i: Item) => i.content)).to.containDeep([
        '測試 Item 1',
        '關聯項目 1',
        '關聯項目 2',
      ]);
    });

    it('應該能夠同時創建 Todo 和 Items', async () => {
      const todoWithItemsData = {
        title: '帶項目的 Todo',
        subtitle: '測試副標題',
        status: TodoStatus.ACTIVE,
        items: [
          {
            content: '同時創建的項目 1',
            isCompleted: false,
          },
          {
            content: '同時創建的項目 2',
            isCompleted: true,
          },
        ],
      };

      const response = await client
        .post('/todos')
        .send(todoWithItemsData)
        .expect(200);

      expect(response.body.title).to.equal(todoWithItemsData.title);
      expect(response.body.items).to.have.lengthOf(2);

      // 檢查項目是否正確創建
      expect(response.body.items[0].content).to.be.oneOf([
        '同時創建的項目 1',
        '同時創建的項目 2',
      ]);
      expect(response.body.items[1].content).to.be.oneOf([
        '同時創建的項目 1',
        '同時創建的項目 2',
      ]);

      // 檢查已完成項目是否有完成時間
      const completedItem = response.body.items.find(
        (item: Item) => item.isCompleted,
      );
      expect(completedItem).to.not.be.undefined();
      expect(completedItem.completedAt).to.not.be.undefined();
    });
  });
});
