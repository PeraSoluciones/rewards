const peopleRouter = require('express').Router();
const supabase = require('../utils/connection');

peopleRouter.get('/', async (req, res, next) => {
  const { data, error } = await supabase.from('people').select();

  if (error) next(error);
  else if (data?.length) res.status(200).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

peopleRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('people')
    .insert(req.body)
    .select();

  if (error) next(error);
  else if (data?.length) res.status(201).json(data);
  else {
    const err = { message: 'row-level security policy violation' };
    next(err);
  }
});

peopleRouter.put('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('people')
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

peopleRouter.delete('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('people')
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

module.exports = peopleRouter;
