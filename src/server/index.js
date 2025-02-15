import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Create a test account using Ethereal Email
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'ethereal.user@ethereal.email', // Will be replaced with actual credentials
    pass: 'ethereal.pass'
  }
});

// Initialize test account
async function initializeMailer() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter.options.auth.user = testAccount.user;
    transporter.options.auth.pass = testAccount.pass;
    console.log('Test account created:', testAccount.user);
  } catch (error) {
    console.error('Failed to create test account:', error);
  }
}

initializeMailer();

app.post('/api/create-email', async (req, res) => {
  try {
    const username = Math.random().toString(36).substring(2, 12);
    const email = `${username}@gmail.com`;
    
    res.json({ email, token: email });
  } catch (error) {
    console.error('Error creating email:', error);
    res.status(500).json({ error: 'Failed to create email' });
  }
});

app.get('/api/emails', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // For demonstration, create a sample email
    const emails = [{
      id: Math.random().toString(36).substring(2),
      fromEmail: 'sender@example.com',
      subject: 'Welcome to Your Temporary Email',
      content: 'This is a test email to demonstrate the functionality.',
      createdAt: new Date().toISOString(),
      read: false
    }];

    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});