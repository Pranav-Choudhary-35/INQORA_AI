# InqoraAI

Full-stack AI chat application with account-based access, persistent chat history, and streamed responses.

## Features

- User registration and login with JWT stored in HTTP cookies
- Email verification before login is allowed
- Password hashing with `bcryptjs`
- Chat creation, chat history retrieval, and chat deletion
- Streamed AI responses from backend to frontend
- Automatic title generation for new chats
- Internet search tool support in the AI layer through Tavily

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- LangChain
- Mistral AI
- Google Gemini integration through LangChain
- Tavily
- JWT
- Nodemailer
- Socket.io

### Frontend

- React
- Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Socket.io client

## Setup

### Backend

1. Go to `Backend/`
2. Run `npm install`
3. Create a `.env` file with:
   `MONGODB_URI`, `JWT_SECRET`, `MISTRAL_API_KEY`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, `GOOGLE_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
4. Start the server with `npm run dev`

### Frontend

1. Go to `Frontend/`
2. Run `npm install`
3. Start the app with `npm run dev`

The frontend sends HTTP requests to `/api/...`. In local development, backend CORS and Socket.io are configured for `http://localhost:5173`.

## Folder Structure

```text
Backend/
  server.js
  src/
    app.js
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    sockets/

Frontend/
  src/
    app/
      app.store.js
      features/
        auth/
        chat/
```

## Notes

- The chat response stream is implemented through the `/api/chat/stream` endpoint using an SSE-style response.
- Socket.io is initialized on both backend and frontend, but the current chat message flow does not use sockets.
