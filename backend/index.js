const express = require('express');
const logger = require('./utils/logger');
const config = require('./utils/config');
const behaviorRouter = require('./controllers/behavior');

const app = express();

app.use('/api/behavior', behaviorRouter);
app.listen(config.PORT, () => logger.info('Server is running on port 3003'));
