const express = require('express');
const { router } = require('./index'); // Import the router from your package

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the API routes
// This maps the router's '/check-ign' to '/api/mobile-legends/check-ign'
app.use('/api/mobile-legends', router);

// Optional: A simple root route for health checks
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    message: 'Mobile Legends IGN Checker API is active.',
    endpoints: {
      check_ign: '/api/mobile-legends/check-ign'
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/mobile-legends/check-ign`);
});
