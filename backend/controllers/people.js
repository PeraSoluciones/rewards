const peopleRouter = require('express').Router();
const supabase = require('../utils/connection');

peopleRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('people')
    .insert(req.body)
    .select();

  if (error) console.log(error.message);
  res.json(data);
  next();
});

module.exports = peopleRouter;
