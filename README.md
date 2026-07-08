# InqoraAI
A full-stack AI chat app with a LangChain agent backend, streaming responses over SSE, and JWT-based authentication.

## Features
- LangChain-based autonomous agent built with `createAgent()` and tool-calling.
- Mistral AI (`mistral-medium-latest`) is the core model driving chat responses and chat title generation.
- Tavily search integration lets the agent pull real-time web results when a query needs fresh information.
- Server-Sent Events (SSE) stream responses token by token from the backend to the client.
- Redux Toolkit manages frontend state with separate `auth` and `chat` slices.
- Authentication includes JWT cookies, bcrypt password hashing, and email verification through Gmail OAuth2 with Nodemailer.
- MongoDB stores users, chats, and messages.

## Tech Stack
- Frontend: React, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios
- Backend: Node.js, Express, LangChain, Mistral AI, Tavily, Nodemailer
- Database: MongoDB with Mongoose
- Auth: JWT, cookies, bcryptjs, email verification flow

## Setup
1. Install dependencies in both apps:
   ```bash
   cd Backend && npm install
   cd ../Frontend && npm install
   ```
2. Create a `.env` file in `Backend/` with MongoDB, JWT, Mistral, Tavily, and Gmail OAuth2 credentials.
3. Start the backend:
   ```bash
   cd Backend
   npm run dev
   ```
4. Start the frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

Frontend runs on `http://localhost:5173`. The backend is configured for that origin in CORS.

## Folder Structure
```text
.
├── Backend/
│   ├── src/
│   │   ├── controllers/    # auth and chat request handlers
│   │   ├── models/         # user, chat, and message schemas
│   │   ├── routes/         # auth and chat routes
│   │   ├── services/       # agent, search, and mail integrations
│   │   ├── middleware/     # auth middleware
│   │   └── config/         # database connection
├── Frontend/
│   ├── src/app/
│   │   ├── features/auth/  # auth pages, slice, API helpers
│   │   ├── features/chat/  # dashboard, slice, chat hooks/services
│   │   ├── app.store.js    # Redux store
│   │   └── app.routes.jsx  # route definitions
│   └── public/
└── README.md
```
