const behaviorRouter = require('express').Router();
const supabase = require('../utils/connection');

const data = [
  {
    id: 1518,
    person_id: 1000,
    date: '15-10-2024',
    behavior: 'positive',
    activity_id: 10,
  },
  {
    id: 1519,
    person_id: 1000,
    date: '15-10-2024',
    behavior: 'positive',
    activity_id: 20,
  },
  {
    id: 1520,
    person_id: 1000,
    date: '15-10-2024',
    behavior: 'negative',
    activity_id: 30,
  },
  {
    id: 1521,
    person_id: 1000,
    date: '15-10-2024',
    behavior: 'positive',
    activity_id: 40,
  },
  {
    id: 1522,
    person_id: 1000,
    date: '15-10-2024',
    behavior: 'negative',
    activity_id: 50,
  },
];

behaviorRouter.get('/', (req, res) => {
  res.json(data);
});

behaviorRouter.post('/', (req, res) => {});

module.exports = behaviorRouter;
