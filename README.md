# Personalized News Aggregator API

A RESTful API built with Node.js and Express for user authentication, JWT-protected preferences, and personalized news retrieval.

## Features

- User signup with bcrypt password hashing
- User login with JWT token generation
- Protected preference management
- Personalized `/news` endpoint
- GNews integration when `GNEWS_API_KEY` is configured
- In-memory cache for news responses
- Clear validation and auth error responses
- Modular routes, middleware, services, and validators

## Setup

```bash
npm install
```

Create a `.env` file if you want custom secrets or live news.
To use live news, go to https://docs.gnews.io/#introduction, create a GNews API key, and add it to `.env`:

```env
PORT=3000
JWT_SECRET=replace-with-a-long-secret
GNEWS_API_KEY=your-gnews-api-key
```

The API still works without `GNEWS_API_KEY` by returning local fallback articles, which keeps development and tests reliable.

## Run

```bash
npm start
```

## Test

```bash
npm test
```

## Endpoints

### `POST /users/signup`

Creates a user.

```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

### `POST /users/login`

Returns a JWT token.

```json
{
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

### `GET /users/preferences`

Requires:

```http
Authorization: Bearer <token>
```

### `PUT /users/preferences`

Requires a token and updates the current user's preferences.

```json
{
  "preferences": ["movies", "comics", "games"]
}
```

### `GET /news`

Requires a token and returns articles matched to the user's saved preferences.

## Notes

User data is stored in memory for this guided project, so restarting the server clears users and preferences. A database can be added later without changing the route contract.
