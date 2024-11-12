const activitiesRouter = require('express').Router();
const supabase = require('../utils/connection');

activitiesRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
    .insert(req.body)
    .select();
  if (error) console.log('error=>', error.message);

  res.json(data);
  next();
});

module.exports = activitiesRouter;
