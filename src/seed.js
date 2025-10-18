// src/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Upsert demo users
  const eli = await prisma.user.upsert({
    where: { email: "eli@example.com" },
    update: {},
    create: { name: "Eli", email: "eli@example.com" },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice", email: "alice@example.com" },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { name: "Bob", email: "bob@example.com" },
  });

  // Upsert demo tickets
  const ticket1 = await prisma.ticket.upsert({
    where: { title: "Login Issue" },
    update: {},
    create: {
      title: "Login Issue",
      description: "Cannot log into the account",
      userId: eli.id,
    },
  });

  const ticket2 = await prisma.ticket.upsert({
    where: { title: "Payment Failure" },
    update: {},
    create: {
      title: "Payment Failure",
      description: "Payment is not going through",
      userId: alice.id,
    },
  });

  // Upsert messages (checks content + ticketId to avoid duplicates)
  await prisma.message.upsert({
    where: { id: 1 }, // change if you have a better unique constraint
    update: {},
    create: {
      content: "I tried resetting my password but it didn't work",
      ticketId: ticket1.id,
      userId: eli.id,
    },
  });

  await prisma.message.upsert({
    where: { id: 2 }, // change if needed
    update: {},
    create: {
      content: "Payment failed with credit card, please help!",
      ticketId: ticket2.id,
      userId: alice.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
