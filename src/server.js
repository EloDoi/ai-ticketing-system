// src/server.js
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// -------------------- USERS --------------------

// Create a new user
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { tickets: true, messages: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// -------------------- TICKETS --------------------

// Get all tickets with optional filtering
app.get('/api/tickets', async (req, res) => {
  const { status, userId } = req.query;

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        status: status || undefined,
        userId: userId ? parseInt(userId) : undefined,
      },
      include: { user: true, messages: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create a new ticket
app.post('/api/tickets', async (req, res) => {
  const { title, description, userId } = req.body;
  if (!title || !description) return res.status(400).json({ error: "Title and description are required" });

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: 'open',
        user: userId ? { connect: { id: userId } } : undefined,
      },
    });
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket status
app.patch('/api/tickets/:id/status', async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Status is required" });

  try {
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// -------------------- MESSAGES --------------------

// Add a message to a ticket
app.post('/api/tickets/:id/messages', async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { content, userId } = req.body;

  if (!content) return res.status(400).json({ error: "Message content is required" });

  try {
    // Check if ticket exists
    const ticketExists = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticketExists) return res.status(404).json({ error: "Ticket not found" });

    const message = await prisma.message.create({
      data: {
        content,
        ticket: { connect: { id: ticketId } },
        user: userId ? { connect: { id: userId } } : undefined,
      },
    });
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get all messages for a ticket
app.get('/api/tickets/:id/messages', async (req, res) => {
  const ticketId = parseInt(req.params.id);

  try {
    const messages = await prisma.message.findMany({
      where: { ticketId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
