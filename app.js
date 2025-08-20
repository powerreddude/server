/**
 * app.js
 * 
 * This file initializes the Express.js server, Socket.IO server, 
 * and integrates MySQL and Redis connections. It also sets up 
 * middleware, routes, and handles WebSocket connections.
 * 
 * Environment variables are loaded using the dotenv package.
 * 
 * Dependencies:
 * - express: Web framework for Node.js
 * - http: Built-in Node.js module for creating an HTTP server
 * - socket.io: Library for real-time WebSocket communication
 * - mysql: MySQL database connection
 * - redis: Redis database connection
 * - dotenv: Loads environment variables from a .env file
 * 
 * Author: Donnis Moore
 * Date: June 27, 2025
 */

import http from 'http';
import 'dotenv/config'; // Load environment variables from .env file
import app from './express.js'; // Import Express app
import setupSocket from './socket.js'; // Import Socket.IO setup

const server = http.createServer(app);
setupSocket(server); // Initialize Socket.IO with the server

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
