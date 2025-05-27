# Task Manager API Documentation

## Authentication Endpoints

### Register
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

### Login
**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response:**
```json
{
  "access_token": "string"
}
```

## Protected Endpoints Authentication
All endpoints except `/auth/login` and `/auth/register` require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Tasks Endpoints

### Create a Task
**POST** `/tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "YYYY-MM-DD",
  "assigneeId": "number" (optional)
}
```

### Create Multiple Tasks
**POST** `/tasks/bulk`

Create multiple tasks in a single request.

**Request Body:**
```json
[
  {
    "title": "string",
    "description": "string",
    "dueDate": "YYYY-MM-DD",
    "assigneeId": "number" (optional)
  }
]
```

### Get All Tasks
**GET** `/tasks`

Retrieve all tasks with their assignees.

### Get Task by ID
**GET** `/tasks/:id`

Retrieve a specific task by its ID.

### Get Tasks by Assignee
**GET** `/tasks/user/:userId`

Retrieve all tasks assigned to a specific user.

### Update Task
**PATCH** `/tasks/:id`

Update a task's properties.

**Request Body:**
```json
{
  "title": "string" (optional),
  "description": "string" (optional),
  "dueDate": "YYYY-MM-DD" (optional),
  "status": "TODO" | "IN_PROGRESS" | "COMPLETED" (optional),
  "assigneeId": "number" (optional)
}
```

### Delete Task
**DELETE** `/tasks/:id`

Delete a specific task.

## Teams Endpoints

### Create Team
**POST** `/teams`

Create a new team.

**Request Body:**
```json
{
  "name": "string",
  "description": "string" (optional)
}
```

### Get All Teams
**GET** `/teams`

Retrieve all teams with their members.

### Get Team by ID
**GET** `/teams/:id`

Retrieve a specific team by its ID.

### Update Team
**PATCH** `/teams/:id`

Update a team's properties.

**Request Body:**
```json
{
  "name": "string" (optional),
  "description": "string" (optional)
}
```

### Delete Team
**DELETE** `/teams/:id`

Delete a specific team.

### Add Member to Team
**POST** `/teams/:teamId/members/:userId`

Add a user to a team.

### Add Multiple Members to Team
**POST** `/teams/:teamId/members`

Add multiple users to a team.

**Request Body:**
```json
{
  "userIds": [number]
}
```

### Remove Member from Team
**DELETE** `/teams/:teamId/members/:userId`

Remove a user from a team.

## Response Formats

### Success Response
Successful responses will return the requested/modified data with appropriate HTTP status codes:
- GET requests: 200 OK
- POST requests: 201 Created
- PATCH requests: 200 OK
- DELETE requests: 204 No Content

### Error Response
Error responses will include:
```json
{
  "statusCode": number,
  "message": "string",
  "error": "string"
}
```

Common error status codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Data Models

### Task
```typescript
{
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  assignee?: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### Team
```typescript
{
  id: number;
  name: string;
  description?: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
{
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  team?: Team;
  assignedTasks: Task[];
}
```