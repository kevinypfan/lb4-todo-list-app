import {expect} from '@loopback/testlab';
import {MysqlDataSource} from '../../datasources';
import {TodoRepository, ItemRepository} from '../../repositories';
import {TodoStatus} from '../../types';
import {juggler} from '@loopback/repository';

describe('數據庫集成測試', () => {
  let dataSource: juggler.DataSource;
  let todoRepository: TodoRepository;
  let itemRepository: ItemRepository;
  let rootDataSource: juggler.DataSource;

  // 首先連接到 MySQL 根目錄，用於創建測試資料庫
  const rootDbConfig = {
    name: 'mysql-root',
    connector: 'mysql',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'example',
  };

  // 測試資料庫配置
  const testDbConfig = {
    name: 'mysql-test',
    connector: 'mysql',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'example',
    database: 'todo_app_test',
  };

  before(async function () {
    try {
      // 先連接到 MySQL 根目錄
      rootDataSource = new juggler.DataSource(rootDbConfig);

      // 創建測試資料庫（如果不存在）
      await rootDataSource.execute(
        'CREATE DATABASE IF NOT EXISTS todo_app_test;',
      );

      // 關閉根連接
      await rootDataSource.disconnect();

      // 連接到測試資料庫
      dataSource = new MysqlDataSource(testDbConfig);

      // 檢查連接
      await dataSource.ping();

      // 初始化儲存庫
      todoRepository = new TodoRepository(
        dataSource,
        async () => itemRepository,
      );
      itemRepository = new ItemRepository(
        dataSource,
        async () => todoRepository,
      );

      // 確保表格存在
      await dataSource.automigrate();
    } catch (err) {
      console.error('設置測試數據庫失敗:', err);
      if (rootDataSource) await rootDataSource.disconnect();
      throw err;
    }
  });

  beforeEach(async function () {
    // 在每個測試前清空表格
    await todoRepository.deleteAll();
    await itemRepository.deleteAll();
  });

  after(async function () {
    await dataSource.disconnect();
  });

  describe('數據源連接測試', () => {
    it('應該成功連接到測試數據庫', async () => {
      const result = await dataSource.ping();
      expect(result).to.be.ok();
    });
  });

  describe('數據庫事務與回滾測試', () => {
    it('應該在事務中完成操作並提交', async () => {
      const transaction = await todoRepository.dataSource.beginTransaction({
        isolationLevel: 'READ COMMITTED',
        timeout: 30000,
      });

      try {
        // 在事務中創建 Todo
        const todo = await todoRepository.create(
          {
            title: '測試事務',
            status: TodoStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {transaction},
        );

        // 在事務中創建關聯的 Item
        await itemRepository.create(
          {
            content: '事務內的項目',
            isCompleted: false,
            todoId: todo.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {transaction},
        );

        // 提交事務
        await transaction.commit();

        // 驗證數據已提交
        const todos = await todoRepository.find();
        expect(todos).to.have.lengthOf(1);
        expect(todos[0].title).to.equal('測試事務');

        const items = await itemRepository.find();
        expect(items).to.have.lengthOf(1);
        expect(items[0].content).to.equal('事務內的項目');
      } catch (err) {
        // 發生錯誤時回滾事務
        await transaction.rollback();
        throw err;
      }
    });

    it('應該在事務失敗時回滾所有更改', async () => {
      const transaction = await todoRepository.dataSource.beginTransaction({
        isolationLevel: 'READ COMMITTED',
        timeout: 30000,
      });

      try {
        // 在事務中創建 Todo
        await todoRepository.create(
          {
            title: '測試回滾',
            status: TodoStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {transaction},
        );

        // 測試回滾 - 模擬錯誤
        // 回滾事務而不是提交
        await transaction.rollback();

        // 驗證數據未提交
        const todos = await todoRepository.find();
        expect(todos).to.have.lengthOf(0);
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    });
  });

  describe('數據庫結構測試', () => {
    it('應該能夠建立和查詢 Todo 模型', async () => {
      const todo = await todoRepository.create({
        title: '測試 Todo',
        subtitle: '測試副標題',
        status: TodoStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(todo.id).to.be.a.Number();
      expect(todo.title).to.equal('測試 Todo');
      expect(todo.subtitle).to.equal('測試副標題');
      expect(todo.status).to.equal(TodoStatus.ACTIVE);
      expect(todo.createdAt).to.not.be.undefined();
      expect(todo.updatedAt).to.not.be.undefined();
    });

    it('應該能夠建立和查詢 Item 模型', async () => {
      // 首先創建 Todo
      const todo = await todoRepository.create({
        title: '測試 Todo',
        status: TodoStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 創建關聯的 Item
      const item = await itemRepository.create({
        content: '測試 Item',
        isCompleted: false,
        todoId: todo.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(item.id).to.be.a.Number();
      expect(item.content).to.equal('測試 Item');
      expect(item.isCompleted).to.be.false();
      expect(item.todoId).to.equal(todo.id);
      expect(item.createdAt).to.not.be.undefined();
      expect(item.updatedAt).to.not.be.undefined();
    });

    it('應該能夠通過關係查詢 Todo 的 Items', async () => {
      // 創建 Todo
      const todo = await todoRepository.create({
        title: '測試關係',
        status: TodoStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 創建多個關聯的 Items
      await itemRepository.createAll([
        {
          content: '項目 1',
          isCompleted: false,
          todoId: todo.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          content: '項目 2',
          isCompleted: true,
          todoId: todo.id,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // 通過關係查詢 Items
      const todoWithItems = await todoRepository.findById(todo.id, {
        include: [{relation: 'items'}],
      });

      expect(todoWithItems.items).to.have.lengthOf(2);
      expect(todoWithItems.items[0].content).to.be.oneOf(['項目 1', '項目 2']);
      expect(todoWithItems.items[1].content).to.be.oneOf(['項目 1', '項目 2']);

      // 檢查完成狀態
      const completedItem = todoWithItems.items.find(item => item.isCompleted);
      expect(completedItem).to.not.be.undefined();
      expect(completedItem?.completedAt).to.not.be.undefined();
    });

    it('應該能夠通過 Todo 軟刪除功能過濾結果', async () => {
      // 創建多個 Todo
      await todoRepository.createAll([
        {
          title: '活動 Todo',
          status: TodoStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: '已刪除 Todo',
          status: TodoStatus.DELETED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: new Date().toISOString(),
        },
      ]);

      // 查詢所有 Todo（模型的 scope 應該過濾掉已刪除的）
      const todos = await todoRepository.find();

      // 由於模型 scope，應該只返回非刪除狀態的 Todo
      expect(todos).to.have.lengthOf(1);
      expect(todos[0].title).to.equal('活動 Todo');
      expect(todos[0].status).to.equal(TodoStatus.ACTIVE);
    });
  });
});
