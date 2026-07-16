# Personalized News Aggregator API

A RESTful API built with Node.js and Express for user authentication, JWT-protected preferences, and personalized news retrieval.

## Features

- User registration with bcrypt password hashing
- User login with JWT token generation
- Protected structured preference management for categories and languages
- Personalized `/news` endpoint
- GNews integration when `GNEWS_API_KEY` is configured
- In-memory cache for news responses
- Clear validation and auth error responses
- Modular routes, middleware, services, and validators

## Setup

```bash
npm install
```

Create a `.env` file with a JWT secret. To use live news, go to https://docs.gnews.io/#introduction, create a GNews API key, and add it to `.env`:

```env
PORT=3000
JWT_SECRET=replace-with-a-long-secret
GNEWS_API_KEY=your-gnews-api-key
```

The API still works without `GNEWS_API_KEY` by returning local fallback articles, which keeps development and tests reliable.
`JWT_SECRET` is required because the app will not sign tokens with an insecure fallback secret.

## Run

```bash
npm start
```

## Test

```bash
npm test
```

## Endpoints

### `POST /register`

Creates a user.

```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": {
    "categories": ["movies", "comics"],
    "languages": ["en"]
  }
}
```

Legacy alias: `POST /users/signup`

### `POST /login`

Returns a JWT token.

```json
{
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

Legacy alias: `POST /users/login`

### `GET /preferences`

Requires:

```http
Authorization: Bearer <token>
```

Legacy alias: `GET /users/preferences`

### `PUT /preferences`

Requires a token and updates the current user's preferences.

```json
{
  "preferences": {
    "categories": ["technology", "business"],
    "languages": ["en"]
  }
}
```

Legacy alias: `PUT /users/preferences`

### `GET /news`

Requires a token and returns articles matched to the user's saved preferences.

## Notes

User data is stored in memory for this guided project, so restarting the server clears users and preferences. A database can be added later without changing the route contract.
