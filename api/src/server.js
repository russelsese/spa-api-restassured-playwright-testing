const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, '..', 'data', 'registrations.json');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

function readRegistrations() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeRegistrations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/registrations', (req, res) => {
  const { firstName, lastName, email, password, phone, dateOfBirth } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email, and password are required.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const registrations = readRegistrations();
  if (registrations.some(r => r.email === email)) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const record = {
    id: randomUUID(),
    firstName,
    lastName,
    email,
    phone: phone || null,
    dateOfBirth: dateOfBirth || null,
    createdAt: new Date().toISOString(),
  };

  registrations.push(record);
  writeRegistrations(registrations);

  res.status(201).json(record);
});

app.get('/api/registrations', (req, res) => {
  const registrations = readRegistrations();
  res.status(200).json(registrations);
});

app.listen(PORT, () => {
  console.log(`Registration API running on http://localhost:${PORT}`);
});
