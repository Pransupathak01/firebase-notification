# Chat WebSocket Documentation 🚀

This document explains how the real-time chat functionality is implemented in the SyncTalk application using **Socket.IO** and **WebSockets**.

---

## 🏗️ Architecture Overview

The chat system is split into three main parts:
1.  **Socket Service**: Manages the low-level connection and authentication.
2.  **Socket Manager**: A headless component that handles the connection lifecycle based on the user's login state.
3.  **Chat Screens**: Functional components (`ChatRoomsScreen` and `ChatScreen`) that listen for and emit specific events.

---

## 🔌 Connection Lifecycle

### 1. Authentication
The socket connection uses **JWT-based authentication**. When the socket connects, it retrieves the `auth_token` from `EncryptedStorage` and passes it in the `auth` object.

**File**: `src/app/services/socketService.ts`
```typescript
socket = io(BASE_URL, {
  auth: { token },
  transports: ["websocket"],
});
```

### 2. Auto-Connection (`SocketManager`)
To ensure the socket is always connected when a user is logged in, we use a `SocketManager` component placed at the root of the app (`App.tsx`).
*   **Login**: When a token is detected, it calls `connectSocket()`.
*   **Logout**: When the token is cleared, it calls `disconnectSocket()`.

---

## 📁 Screen-Specific Logic

### 1. Chat Rooms List (`ChatListScreen.tsx`)
This screen shows all available chat rooms (referral contacts).
*   **Initial Load**: Fetches rooms via REST API (`/api/chat/referral-contacts`).
*   **Real-time Updates**: Listens for the `room_created` event. If a new referral joins, the list refreshes automatically.

### 2. Chat Conversation (`ChatScreen.tsx`)
This is where the actual messaging happens.

#### **A. Joining a Room**
When you open a chat, the app emits a `join_room` event with the `roomId`.
```typescript
socket.emit("join_room", { roomId });
```

#### **B. Receiving Messages**
The screen listens for two main events:
*   `load_messages`: Triggered immediately after joining. It provides the initial chat history.
*   `receive_message`: Triggered whenever anyone (including you) sends a new message in that room.

#### **C. Sending Messages**
When you hit send, the app emits the `send_message` event.
```typescript
socket.emit("send_message", { roomId, text: "Hello!" });
```

#### **D. Typing Indicators**
*   **Emitting**: When the user types, we emit `typing`. After 2 seconds of inactivity, we emit `stop_typing`.
*   **Listening**: We listen for `user_typing` (shows "X is typing...") and `user_stop_typing` (hides the indicator).

---

## 📡 Event Reference Table

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `connect` | Server ➡️ Client | - | Successfully connected to the server. |
| `join_room` | Client ➡️ Server | `{ roomId }` | Tells the server to subscribe the client to a room. |
| `load_messages` | Server ➡️ Client | `{ messages, hasMore }` | Provides message history for the room. |
| `send_message` | Client ➡️ Server | `{ roomId, text }` | Sends a new message to the room. |
| `receive_message`| Server ➡️ Client | `Message Object` | A new message arrived in the room. |
| `typing` | Client ➡️ Server | `{ roomId }` | Informs others that you are typing. |
| `user_typing` | Server ➡️ Client | `{ username }` | Informs you that a specific user is typing. |
| `mark_read` | Client ➡️ Server | `{ roomId }` | Tells the server you've seen the latest messages. |

---

## 🛠️ Debugging Tips
*   **Metro Logs**: Look for logs prefixed with `✅ Socket connected` or `[ProfileScreen]`.
*   **Socket ID**: The `connected` event on the frontend logs your unique identification string from the server.
*   **Error Handling**: If `connect_error` appears, it usually means the JWT token is expired or the `BASE_URL` is incorrect.

---
