const peopleRouter = require('express').Router();
const supabase = require('../utils/connection');

peopleRouter.get('/', async (req, res, next) => {
  const { data, error } = await supabase.from('people').select();

  if (error) next(error);

  res.status(200).json(data);
});

peopleRouter.post('/', async (req, res, next) => {
  const { data, error } = await supabase
    .from('people')
    .insert(req.body)
    .select();

  if (error) next(error);
  res.json(data);
});

peopleRouter.put('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('people')
    .update(req.body)
    .eq('id', req.params.id)
    .select();

  if (error) next(error);

  res.status(201).json(data);
});

peopleRouter.delete('/:id', async (req, res, next) => {
  const { data, error } = await supabase
    .from('people')
    .delete()
    .eq('id', req.params.id)
    .select();

  if (error) next(error);

  res.status(201).json(data);
});

module.exports = peopleRouter;
