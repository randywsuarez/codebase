# Backend Data Model Documentation

This document describes the data model used in the backend, implemented with Mongoose for MongoDB.

## Models

### User Model

Represents a user in the system.

*   **`username`**: String, unique identifier for the user.
*   **`email`**: String, user's email address (could be unique).
*   **`password`**: String, hashed password for authentication.
*   **`firstName`**: String, user's first name.
*   **`lastName`**: String, user's last name.
*   **`location`**: ObjectId, reference to the Location model (Many-to-One relationship).
*   **`roles`**: Array of ObjectIds, references to the Role model (Many-to-Many relationship).

### Role Model

Represents a user role in the system.

*   **`name`**: String, unique name of the role (e.g., 'admin', 'editor', 'viewer').
*   **`description`**: String, brief description of the role.

### Menu Model

Represents an item in the application's navigation menu.

*   **`name`**: String, the display name of the menu item.
*   **`icon`**: String, the name of the icon for the menu item.
*   **`route`**: String, the frontend route associated with the menu item.
*   **`parent`**: ObjectId (optional), reference to another Menu item if this is a sub-item.

### Permission Model

Defines specific actions that can be performed within the application.

*   **`name`**: String, a unique identifier for the permission (e.g., 'user:read', 'project:create').
### Location Model


Represents a physical location or office.

*   **`name`**: String, unique name of the location.
*   **`address`**: String, physical address of the location.
*   **`city`**: String, city of the location.
*   **`country`**: String, country of the location.

### Project Model

Represents a project.

*   **`name`**: String, unique name of the project.
*   **`description`**: String, detailed description of the project.
*   **`startDate`**: Date, the start date of the project.
*   **`endDate`**: Date, the estimated or actual end date of the project.
*   **`location`**: ObjectId, reference to the Location model (Many-to-One relationship).
*   **`members`**: Array of ObjectIds, references to the User model (Many-to-Many relationship - representing project team members).

## Relationships

### User to Role (Many-to-Many)

*   A User can have multiple Roles.
*   A Role can be assigned to multiple Users.
*   This relationship is modeled in the `User` model by storing an array of `Role` ObjectIds in the `roles` field.

### User to Location (Many-to-One)

*   A User belongs to one Location.
*   A Location can have multiple Users.
*   This relationship is modeled in the `User` model by storing a single `Location` ObjectId in the `location` field.

### Role to Permission (Many-to-Many)

*   A Role can have multiple Permissions.
*   A Permission can be assigned to multiple Roles.
*   This relationship determines what actions a user with a specific role can perform (e.g., create users, read projects).

### Role to Menu (Many-to-Many)

*   A Role can have access to multiple Menu items.
*   A Menu item can be visible to multiple Roles.
*   This relationship controls which menu items are displayed to a user based on their assigned roles.

### Project to Location (Many-to-One)

*   A Project is associated with one Location.
*   A Location can have multiple Projects.
*   This relationship is modeled in the `Project` model by storing a single `Location` ObjectId in the `location` field.

### Project to User (Many-to-Many)

*   A Project can have multiple User members.
*   A User can be a member of multiple Projects.
*   This relationship is modeled in the `Project` model by storing an array of `User` ObjectIds in the `members` field.

## User Token Handling (Authentication and Authorization)

User authentication and authorization in the backend will be handled using **JSON Web Tokens (JWTs)**.

The process is as follows:

1.  **Token Generation on Login:** When a user successfully logs in, the backend will generate a JWT containing relevant user information (e.g., user ID, roles).
2.  **Sending to Frontend:** The generated JWT will be sent back to the frontend in the login response.
3.  **Frontend Storage:** The frontend is responsible for securely storing the received JWT (e.g., in local storage or cookies).
4.  **Sending with Requests:** For subsequent requests to protected routes or resources, the frontend will include the JWT in the `Authorization` header (usually in the format `Bearer [token]`).
5.  **Backend Verification:** Middleware in the backend will intercept protected route requests, extract the JWT from the `Authorization` header, and verify its authenticity and validity using a **secret key**. If the token is valid, the user information within the token can be used to determine if the user has the necessary permissions to access the requested resource or perform the action.

A strong, secret key is essential for the security of the JWT signing and verification process and must be kept confidential.