const activitiesRouter = require('express').Router();
const supabase = require('../utils/connection');

activitiesRouter.get('/', async (req, res, next) => {
  const { data, error } = await supabase.from('activities').select();

  if (error) next(error);
  else if (data?.length) res.status(200).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

activitiesRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
    .insert(req.body)
    .select();

  if (error) next(error);
  else if (data?.length) res.status(201).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

activitiesRouter.put('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
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

activitiesRouter.delete('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('activities')
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

module.exports = activitiesRouter;
