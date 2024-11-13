const behaviorRouter = require('express').Router();
const supabase = require('../utils/connection');

behaviorRouter.get('/', async (req, res, next) => {
  const { data, error } = await supabase.from('behavior_tracking').select();
  if (error) next(error);

  res.json(data);
});

behaviorRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('behavior_tracking')
    .insert(req.body)
    .select();

  if (error) next(error);

  res.status(200).json(data);
});

behaviorRouter.put('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('behavior_tracking')
    .update(req.body)
    .eq('id', req.params.id)
    .select();

  if (error) next(error.message);
  res.status(201).json(data);
});

behaviorRouter.delete('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('behavior_tracking')
    .delete()
    .eq('id', req.params.id)
    .select();

  if (error) next(error);
  res.status(204).json(data);
});

module.exports = behaviorRouter;
