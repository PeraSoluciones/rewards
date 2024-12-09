const activitiesRouter = require('express').Router();
const supabase = require('../utils/connection');

activitiesRouter.get('/', async (req, res, next) => {
  const { data, error } = await supabase.from('activities').select();

  if (error) next(error);
  else res.status(200).json(data);
});

activitiesRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
    .insert(req.body)
    .select();

  if (error) next(error);
  else res.status(201).json(data);
});

activitiesRouter.put('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
    .update(req.body)
    .eq('id', req.params.id)
    .select();

  if (error) next(error);
  else res.status(201).json(data);
});

activitiesRouter.delete('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
    .delete()
    .eq('id', req.params.id)
    .select();

  if (error) next(error);
  else res.status(204).json(data);
});

module.exports = activitiesRouter;
