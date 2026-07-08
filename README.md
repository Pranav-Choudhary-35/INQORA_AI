# InqoraAI - Beginner's Implementation Guide

Welcome to the InqoraAI project! This guide is designed to help beginner programmers understand how to build and structure this project from scratch.

## 🚀 How to Build and Run the Project

Follow these steps to get the project running on your local machine:

1. **Prerequisites**: Make sure you have Node.js and MongoDB installed on your computer.
2. **Install Backend Dependencies**: 
   - Open your terminal and navigate to the `Backend` folder.
   - Run `npm install` to install all required packages.
3. **Install Frontend Dependencies**:
   - Open a new terminal and navigate to the `Frontend` folder.
   - Run `npm install`.
4. **Environment Variables**:
   - In the `Backend` folder, create a `.env` file and add your MongoDB connection string, JWT secret, and AI API keys.
5. **Start the Servers**:
   - In the `Backend` terminal, run `npm start` or `npm run dev` to start the backend server.
   - In the `Frontend` terminal, run `npm run dev` to start the React application.

---

## 📁 Folder Structure & File Explanations

Here is a breakdown of the project structure so you know where everything lives.

### Frontend (React Application)
The frontend is responsible for the user interface and how the user interacts with the app.

* `src/app/`
  * `App.jsx`: The main wrapper component for the entire React application.
  * `app.routes.jsx`: Handles navigation. It decides which page to show based on the URL.
* `src/features/auth/`
  * `pages/Login.jsx` & `Register.jsx`: The screens where users can sign in or create an account.
  * `hooks/useAuth.js`: A helper file that manages the user's login state (checking if they are logged in or not).
* `src/features/chat/`
  * `pages/Dashboard.jsx`: The main chat interface where the user talks to the AI.
  * `hooks/useChat.js`: Handles sending messages, receiving messages, and managing the chat history.

### Backend (Node.js & Express API)
The backend handles data storage, authentication, and communicating with the AI model.

* `src/models/`
  * `user.model.js`: Defines what a User looks like in the database (email, password, etc.).
  * `chat.model.js`: Defines a Chat session, linking a user to their messages.
  * `message.model.js`: Defines individual messages, storing who sent it (User or AI) and the text.
* `src/controllers/`
  * `auth.controller.js`: Contains the logic for registering, logging in, and verifying users.
  * `chat.controller.js`: Logic for retrieving chat history and handling new messages.
* `src/routes/`
  * `auth.routes.js`: Links URLs (like `/api/auth/login`) to the functions in the auth controller.
  * `chat.routes.js`: Links chat-related URLs to the chat controller.
* `src/services/`
  * `ai.service.js`: The file responsible for directly talking to the AI model.

---

## 🤖 Implementing the AI Model (In Detail)

The core feature of this project is the AI chat. Here is a detailed, beginner-friendly explanation of how the AI is integrated into the application.

### Step 1: Setting up the AI Service
We isolate all our AI logic into a single file: `Backend/src/services/ai.service.js`. This makes the code organized.
1. **Initialize the AI**: You will import the SDK (Software Development Kit) provided by your AI provider (like Google Gemini or OpenAI) and configure it using the API key from your `.env` file.
2. **Create a Generation Function**: You will write a function, for example `generateAIResponse(prompt)`. This function takes the user's text as input, sends it to the AI model over the internet, and waits for the AI to reply.
3. **Error Handling**: Always wrap your AI call in a `try-catch` block. If the AI service is down or your API key is invalid, your server won't crash, and you can send a friendly error message back to the user.

### Step 2: Connecting AI to the Chat Logic
Once the `ai.service.js` is ready, you need to use it when a user sends a message. This happens in `Backend/src/controllers/chat.controller.js`.
1. **Receive User Message**: When a user types a message on the frontend, it is sent to the backend.
2. **Save to Database**: First, save the user's message into your database so you don't lose it.
3. **Call the AI Service**: Call the `generateAIResponse()` function you created in Step 1, passing in the user's message.
4. **Save AI Response**: Wait for the AI to return its text. Once you have it, save this new AI message to the database, linked to the same chat session.
5. **Send Back to Frontend**: Finally, send the AI's text response back to the frontend so it can be displayed on the user's screen.

By following this pattern, you ensure that the AI implementation is clean, secure, and easy to update if you ever decide to switch to a different AI model in the future!
