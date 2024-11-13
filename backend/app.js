const express = require('express');
const cors = require('cors');
const behaviorRouter = require('./controllers/behavior');
const activitiesRouter = require('./controllers/activities');
const peopleRouter = require('./controllers/people');
const middleware = require('./utils/middleware');
const app = express();

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/behavior', behaviorRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/people', peopleRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
