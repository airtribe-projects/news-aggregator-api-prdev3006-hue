require('dotenv').config({ quiet: true });

const express = require('express');
const userRoutes = require('./src/routes/users');
const newsRoutes = require('./src/routes/news');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Personalized News Aggregator API',
    endpoints: ['/users/signup', '/users/login', '/users/preferences', '/news'],
  });
});

app.use('/users', userRoutes);
app.use('/news', newsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
