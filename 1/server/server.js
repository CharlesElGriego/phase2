const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Environment variables
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Create the server
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Utility function to generate a random deadline, 2 days from now
function generateRandomDeadline() {
  const now = new Date();
  const maxDays = 2; // Maximum of 2 days from today
  const randomMilliseconds = Math.floor(Math.random() * (maxDays * 24 * 60 * 60 * 1000)); // Random time within 2 days

  const deadlineDate = new Date(now.getTime() + randomMilliseconds); // Ensure it's in the future

  const secondsLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / 1000);
  return { secondsLeft };
}

// Ensure the `db.json` file contains a fresh deadline on server start
function initializeDatabase() {
  const dbFilePath = path.join(__dirname, 'db.json');
  const initialData = { deadline: generateRandomDeadline() };

  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
  } else {
    const dbContent = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    dbContent.deadline = initialData.deadline; // Update the deadline
    fs.writeFileSync(dbFilePath, JSON.stringify(dbContent, null, 2));
  }
}

// Initialize the database before starting the server
initializeDatabase();

// Middleware for CORS and default behaviors
server.use(middlewares);

// Attach the router to the API prefix
server.use(API_PREFIX, router);

// Start the server
server.listen(PORT, () => {
  console.log(`JSON Server is running at http://localhost:${PORT}${API_PREFIX}`);
});
