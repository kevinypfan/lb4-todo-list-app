// 載入環境變數
import * as dotenv from 'dotenv';
import path from 'path';

// 根據 NODE_ENV 環境變數決定載入哪個 .env 文件
const envPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(__dirname, '../.env.test')
  : path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

import {TodoListApplication} from './application';

export async function migrate(args: string[]) {
  const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';
  console.log('Migrating schemas (%s existing schema)', existingSchema);

  const app = new TodoListApplication();
  await app.boot();
  await app.migrateSchema({existingSchema});

  // Connectors usually keep a pool of opened connections,
  // this keeps the process running even after all work is done.
  // We need to exit explicitly.
  process.exit(0);
}

migrate(process.argv).catch(err => {
  console.error('Cannot migrate database schema', err);
  process.exit(1);
});
