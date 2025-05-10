# Todo List Application

This is a Todo List management system developed with the [LoopBack 4](https://loopback.io/doc/en/lb4/index.html) framework. The application provides a complete REST API supporting CRUD operations for todo items and management of sub-items for each todo.

## Features

- Complete Todo item management, including:
  - Creating, updating, querying, and soft deleting Todos
  - Support for adding multiple sub-items to each Todo
  - Marking sub-items as completed or incomplete
- Pagination support for retrieving Todo lists
- Soft delete: Todos aren't actually removed from the database, just marked as deleted
- One-click deployment with Docker, including the application and MySQL database
- Automatic database migration when starting the application

## Technology Stack

- **Backend Framework**: LoopBack 4 (based on TypeScript and Node.js)
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **API Documentation**: OpenAPI (Swagger)
- **Database Management Tool**: Adminer

## Installation and Setup

### Prerequisites

- Node.js v18+ or Docker environment
- MySQL database (for local development) or use Docker Compose

### Installing Dependencies

```sh
npm install
# or use pnpm
pnpm install
```

To install only the dependencies specified in package-lock.json:

```sh
npm ci
```

### Environment Variables

Create a `.env` file in the project root (reference `.env.example`), and set the following environment variables:

```
# Application server settings
HOST=0.0.0.0
PORT=3000

# MySQL database settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=example
DB_DATABASE=todo_app
DB_URL=mysql://root:example@localhost:3306/todo_app
```

## Running the Application

### Local Development Mode

```sh
# Compile TypeScript to JavaScript
npm run build

# Run database migration (first time or when updating database structure)
npm run migrate

# Start the application
npm start
```

Visit http://127.0.0.1:3000 to view the application.
Visit http://127.0.0.1:3000/explorer to access the API documentation.

### Using Docker Compose

This is the simplest way to set up the entire environment (including the application, MySQL database, and Adminer):

```sh
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

After the services start:
- Application API: http://localhost:3000
- API Documentation: http://localhost:3000/explorer
- Adminer Database Management Tool: http://localhost:8080
  - Server: mysql
  - Username: root
  - Password: password
  - Database: todo_app

## API Endpoints

The application provides the following main API endpoints:

### Todo Related

- `GET /todos`: Get all Todos (with pagination support)
- `GET /todos/{id}`: Get a single Todo with its sub-items
- `POST /todos`: Create a new Todo (can create sub-items simultaneously)
- `PATCH /todos/{id}`: Partially update a Todo
- `PUT /todos/{id}`: Completely replace a Todo
- `DELETE /todos/{id}`: Soft delete a Todo
- `GET /todos/count`: Get the number of Todos

### Todo Sub-items Related

- `GET /todos/{id}/items`: Get all sub-items for a Todo
- `POST /todos/{id}/items`: Add a new sub-item to a Todo
- `PATCH /todos/{id}/items`: Batch update sub-items
- `DELETE /todos/{id}/items`: Delete sub-items

## Data Models

### Todo

```typescript
{
  id: number;            // Auto-increment ID
  title: string;         // Title (required)
  subtitle?: string;     // Subtitle (optional)
  status: string;        // Status (ACTIVE, INACTIVE, DELETED)
  createdAt: string;     // Creation time
  updatedAt: string;     // Update time
  deletedAt?: string;    // Deletion time (for soft delete)
  items: Item[];         // Associated sub-items list
}
```

### Item (Sub-item)

```typescript
{
  id: number;            // Auto-increment ID
  content: string;       // Content (required)
  isCompleted: boolean;  // Whether completed
  completedAt?: string;  // Completion time
  createdAt: string;     // Creation time
  updatedAt: string;     // Update time
  todoId: number;        // Associated Todo ID
}
```

## Development Commands

```sh
# Compile the project
npm run build

# Watch for file changes and automatically recompile
npm run build:watch

# Database migration (create/update table structure)
npm run migrate

# Database migration (force rebuild database, use with caution!)
npm run migrate -- --rebuild

# Run tests
npm test

# Code style check
npm run lint

# Automatically fix code style issues
npm run lint:fix

# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## Developer Guide

For more development-related information, please refer to the [DEVELOPING.md](DEVELOPING.md) file and the [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/).

## License

This project is licensed under the [MIT License](LICENSE).

---

[![Powered by LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)
