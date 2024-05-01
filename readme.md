# Project Setup

To set up the project, follow these steps:

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Set up environment variables by creating a `.env` file in the root directory and adding the required variables from sample.env.

# APIs

### Authentication Routes

- **Sign Up:** `POST /api/auth/signup`

  - **Required Payload:**
    ```json
    {
      "email": "example",
      "password": "password123"
    }
    ```

- **Sign In:** `POST /api/auth/signin`

  - **Required Payload:**
    ```json
    {
      "email": "example",
      "password": "password123"
    }
    ```

- **Google OAuth Login:**
  - **Request:** `POST /api/auth/google/login`
  - **Callback:** `GET /api/auth/google/callback`

### User Routes

- **Update Username:** `PUT /api/user/username`
  - **Required Payload:**
    ```json
    {
      "newUsername": "new_example"
    }
    ```

### Goal Routes

- **Create Goal:** `POST /api/goal`

  - **Required Payload:**

    ```json
    {
      "title": "Exercise Daily",
      "description": "Exercise for at least 30 minutes every day.",
      "targetCompletionDate": "2024-05-15",
      "category": "Health",
      "isPublic": true,
      "recurring": true,
      "recurrenceFrequency": "daily",
      "recurrenceStartDate": "2024-05-01",
      "recurrenceEndDate": "2024-06-01"
    }
    ```

- **Update Goal:** `PUT /api/goal/:id`

  - **Required Payload:**
    ```json
    {
      // "title": "5k run yay"
      // "description": "Run 5 kilometers in the park",
      // "targetCompletionDate": "2024-05-01T08:00:00.000Z",
      // "category": "Health"
      // "recurring": true,
      // "recurrenceFrequency": "Weekly",
      // "recurrenceStartDate": "2024-04-28",
      // // "recurrenceEndDate": "2024-06-01",
      "isPublic": true
    }
    ```

- **Delete Goal:** `DELETE /api/goal/:id`

- **Mark Goal as Completed or revert completed:** `PUT /api/goal/:id/complete`

  - **Optional Query Param pass isComplete to false to revert back a completed goal:**

    ```
    isComplete: true/false/0/1
    ```

- **List User Goals:** `GET /api/goal`

- **List Public Goals:** `GET /api/goal/public`

# Commands

To run the application, you can use the following commands:

- **Development Mode:** `yarn dev`
- **Build:** `yarn build`
- **Start:** `yarn start`

# Note

Google credentials in env are not needed if you are doing normal signup and signin
