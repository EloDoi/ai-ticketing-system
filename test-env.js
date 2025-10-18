// test-env.js
require('dotenv').config();

console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "SET" : "NOT SET");
console.log("PORT =", process.env.PORT);
