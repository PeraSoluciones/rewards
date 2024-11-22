const { test, beforeEach, describe } = require('node:test');
const supabase = require('../utils/connection');
const assert = require('node:assert');
const supertest = require('supertest');
const { activities } = require('../utils/list_activities');
const app = require('../app');

const api = supertest(app);

describe('when there is initially some activities saved', () => {
  beforeEach(async () => {
    const { data, error } = await supabase.rpc('truncate_table', {
      table_name: 'activities',
    });
    if (error) console.log(error.message);
    const { errorActivities } = await supabase
      .from('activities')
      .insert(activities);

    if (errorActivities) console.log(errorActivities.message);
  });

  test('activities are returned as json', async () => {
    await api
      .get('/api/activities')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are 5 activities', async () => {
    const response = await api.get('/api/activities');
    assert.strictEqual(response.body.length, 5);
  });

  test('the first activity is Obedece a los profesores', async () => {
    const response = await api.get('/api/activities');
    const activities = response.body.map((a) => a.name);
    assert(activities.includes('Obedece a los profesores'), true);
  });

  describe('addition of a new activity', () => {
    test('a valid activity can be added', async () => {
      const newActivity = {
        name: 'Comportamiento con los compañeros',
        description: 'ESCUELA',
      };

      const response = await api
        .post('/api/activities', newActivity)
        .send(newActivity)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const { data, error } = await supabase.from('activities').select();
      if (error) console.log(error.message);

      assert.strictEqual(data.length, activities.length + 1);
      const activitiesName = data.map((a) => a.name);
      assert(activitiesName.includes('Comportamiento con los compañeros'));
    });

    test('fails on missing name', async () => {
      const newActivity = {
        description: 'ESCUELA',
      };
      const response = await api
        .post('/api/activities', newActivity)
        .send(newActivity)
        .expect(400);

      assert(response.body.err.message.includes('null value in column "name"'));
    });

    test('fails on duplicate name', async () => {
      const newActivity = { name: 'Obedece a los padres', description: 'CASA' };
      const response = await api
        .post('/api/activities', newActivity)
        .send(newActivity)
        .expect(400);

      assert(response.body.err.message.includes('duplicate key value'));
    });
  });

  describe('update activity', () => {
    test('succeeds with status 201', async () => {
      const activityUpdate = { name: 'Obedece a los padres y abuelos' };
      const response = await api
        .put('/api/activities/1', activityUpdate)
        .send(activityUpdate)
        .expect(201);

      assert.strictEqual(activityUpdate.name, response.body[0].name);
    });
  });

  describe('delete activity', () => {
    test('succeeds with code 204', async () => {
      const response = await api.delete('/api/activities/1').expect(204);
    });
  });
});
