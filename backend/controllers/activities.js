const activitiesRouter = require('express').Router();
const supabase = require('../utils/connection');

activitiesRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
    .insert(req.body)
    .select();
  if (error) next(error);

  res.json(data);
});

module.exports = activitiesRouter;
