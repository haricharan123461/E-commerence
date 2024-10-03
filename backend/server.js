const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let users = []; // Store registered users
let submissions = [];
let submissionId = 0;

// Setup multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/submissions/:username', (req, res) => {
    const { username } = req.params;
    const userSubmissions = submissions.filter(submission => submission.name === username);
  
    if (userSubmissions.length > 0) {
      res.json(userSubmissions);
    } else {
      res.status(404).json({ error: "No submissions found for this user." });
    }
  });
  

// Registration endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists." });
  }

  // Register new user
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully!" });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { role, username, password } = req.body;

  // Check if the user is registered
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return res.status(401).json({ error: "You must register first." });
  }

  if (role === "admin") {
    if (username === "admin" && password === "admin123") {
      return res.status(200).json({ message: "Admin logged in successfully!" });
    } else {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }
  }

  return res.status(200).json({ message: "User logged in successfully!" });
});

// Apparel submission endpoint
app.post('/submit', upload.single('image'), (req, res) => {
  const { name, condition, type, additionalNotes } = req.body;

  const submission = {
    id: ++submissionId,
    name,
    condition,
    type,
    additionalNotes,
    image: req.file ? req.file.buffer.toString('base64') : null
  };

  submissions.push(submission);
  res.status(201).json(submission);
});

// Get all submissions (for admin)
app.get('/submissions', (req, res) => {
  res.json(submissions);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
