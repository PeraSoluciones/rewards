const express = require('express');
const config = require('./utils/config');
const logger = require('./utils/logger');
const behaviorRouter = require('./controllers/behavior');
const activitiesRouter = require('./controllers/activities');
const peopleRouter = require('./controllers/people');

const app = express();

app.use(express.json());
app.use('/api/behavior', behaviorRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/people', peopleRouter);
app.listen(config.PORT, () => logger.info('Server running on port 3003'));
