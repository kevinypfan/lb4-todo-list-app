# todo-list-app

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```

## 環境變數設定

請在專案根目錄建立 `.env` 文件（可參考 `.env.example`），並設定以下環境變數：

```
# MySQL 資料庫設定
DB_HOST=localhost        # 資料庫主機
DB_PORT=3306             # 資料庫端口
DB_USER=root             # 資料庫用戶名
DB_PASSWORD=example      # 資料庫密碼
DB_DATABASE=todo_app     # 資料庫名稱
DB_URL=mysql://root:example@localhost:3306/todo_app  # 資料庫連接 URL
```

## Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

## Rebuild the project

To incrementally build the project:

```sh
npm run build
```

To force a full build by cleaning up cached artifacts:

```sh
npm run rebuild
```

## Fix code style and formatting issues

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```

## Other useful commands

- `npm run migrate`: Migrate database schemas for models
- `npm run openapi-spec`: Generate OpenAPI spec into a file
- `npm run docker:build`: Build a Docker image for this application
- `npm run docker:run`: Run this application inside a Docker container

## 使用 Docker

使用 Docker 運行應用程式時，可以通過環境變數設定資料庫連接：

```sh
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=3306 \
  -e DB_USER=your-user \
  -e DB_PASSWORD=your-password \
  -e DB_DATABASE=your-database \
  -d todo-list-app
```

## Tests

```sh
npm test
```

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)
