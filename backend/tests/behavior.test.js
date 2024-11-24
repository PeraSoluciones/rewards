const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const supabase = require('../utils/connection');
const { behavior } = require('../utils/list_behavior');
const app = require('../app');

const api = supertest(app);

describe('when there is initially some registers saved', () => {
  beforeEach(async () => {
    const { data, error } = await supabase.rpc('truncate_table', {
      table_name: 'behavior_tracking',
    });
    if (error) console.log(error.message);

    const { errorInsert } = await supabase
      .from('behavior_tracking')
      .insert(behavior);
    if (errorInsert) console.log(errorInsert.message);
  });

  test('behaviors are returned as json', async () => {
    await api
      .get('/api/behavior')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are 5 behaviors', async () => {
    const response = await api.get('/api/behavior').expect(200);
    assert.strictEqual(response.body.length, 5);
  });

  test('there is an activity Obedece a los padres', async () => {
    const response = await api.get('/api/behavior').expect(200);
    const activityNames = response.body.map((a) => a.activities.name);
    assert(activityNames.includes('Obedece a los padres'));
  });

  describe('adding a new behavior', () => {
    test('a valid behavior can be added', async () => {
      const newBehavior = {
        person_id: 1,
        date: '2024-11-02',
        behavior: 'positive',
        activity_id: 3,
      };
      const response = await api
        .post('/api/behavior', newBehavior)
        .send(newBehavior)
        .expect(200);

      assert(response.body.length, behavior.length + 1);
    });

    test('fails on missing behavior', async () => {
      const newBehavior = {
        person_id: 1,
        date: '2024-11-02',
        activity_id: 3,
      };

      const response = await api
        .post('/api/behavior', newBehavior)
        .send(newBehavior)
        .expect(400);

      assert(
        response.body.err.message.includes('null value in column "behavior"')
      );
    });

    test('fails on duplicate row', async () => {
      const newBehavior = {
        person_id: 1,
        date: '2024-11-01',
        behavior: 'positive',
        activity_id: 3,
      };

      const response = await api
        .post('/api/behavior', newBehavior)
        .send(newBehavior)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'duplicate key value violates unique constraint'
        )
      );
    });
  });

  describe('update behavior', () => {
    test('succeed with status code 201', async () => {
      const behaviorToUpdate = { behavior: 'positive' };
      const response = await api
        .put('/api/behavior/2', behaviorToUpdate)
        .send(behaviorToUpdate)
        .expect(201);

      assert.strictEqual(response.body[0].behavior, behaviorToUpdate.behavior);
    });

    test('fails on duplicate row', async () => {
      const behaviorToUpdate = { activity_id: 3 };
      const response = await api
        .put('/api/behavior/5', behaviorToUpdate)
        .send(behaviorToUpdate)
        .expect(400);

      assert(
        response.body.err.includes(
          'duplicate key value violates unique constraint'
        )
      );
    });
  });

  describe('delete behavior', () => {
    test('succeed with status code 204', async () => {
      const response = await api.delete('/api/behavior/5').expect(204);
    });
  });
});
