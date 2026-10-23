require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Smart Attendance API listening on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

