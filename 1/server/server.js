const express = require('express');
const cors = require('cors'); // Add CORS middleware
const dotenv = require('dotenv');

dotenv.config();
// Constants
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api';
const MANUALLY_SET_DEADLINE = process.env.MANUALLY_SET_DEADLINE; // Check for manual deadline in environment variables

// Enable CORS for all routes
app.use(cors());

// Controller for deadlines
app.get(`${API_PREFIX}/deadline`, (req, res) => {
  let deadline;
  // If a manual deadline is set, use it
  if (MANUALLY_SET_DEADLINE) {
    const now = new Date();
    console.log('*Manually set deadline (in seconds):', MANUALLY_SET_DEADLINE);
    const secondsToAdd = parseInt(MANUALLY_SET_DEADLINE, 10); // Parse the seconds from the environment variable
    if (isNaN(secondsToAdd) || secondsToAdd <= 0) {
      // Invalid or past deadline
      deadline = { secondsLeft: 0 }; // Deadline already passed
    } else {
      deadline = {
        secondsLeft: secondsToAdd,
      };
    }
  } else {
    // Generate a random deadline if no manual deadline is set
    deadline = generateRandomDeadline();
  }
  console.log('**Deadline:', deadline);
  res.json(deadline);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}${API_PREFIX}`);
});

// Utility function to generate a random deadline
function generateRandomDeadline() {
  const now = new Date();
  const maxDays = 2; // Maximum of 2 days from today
  const randomMilliseconds = Math.floor(
    Math.random() * (maxDays * 24 * 60 * 60 * 1000)
  ); // Random time within 2 days
  const deadlineDate = new Date(now.getTime() + randomMilliseconds); // Ensure it's in the future
  const secondsLeft = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / 1000
  );
  return { secondsLeft };
}
