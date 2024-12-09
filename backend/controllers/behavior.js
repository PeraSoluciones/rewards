const behaviorRouter = require('express').Router();
const supabase = require('../utils/connection');

behaviorRouter.get('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('behavior_tracking')
    .select('id, people(*), date, behavior, activities(*)');

  if (error) next(error);
  else if (data?.length) res.status(200).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

behaviorRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('behavior_tracking')
    .insert(req.body)
    .select();

  if (error) next(error);
  else if (data?.length) res.status(201).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

behaviorRouter.put('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('behavior_tracking')
    .update(req.body)
    .eq('id', req.params.id)
    .select();

  if (error) next(error);
  else if (data?.length) res.status(201).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

behaviorRouter.delete('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('behavior_tracking')
    .delete()
    .eq('id', req.params.id)
    .select();

  if (error) next(error);
  else if (data?.length) res.status(204).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

module.exports = behaviorRouter;
