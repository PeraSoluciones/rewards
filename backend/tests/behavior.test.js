const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const supabase = require('../utils/connection');
const { behavior } = require('../utils/list_behavior');
const { resetDB } = require('../utils/behavior_helper');
const app = require('../app');

const api = supertest(app);

describe('when there is initially some registers saved', () => {
  beforeEach(() => resetDB(supabase));

  test('behaviors are returned as json', async () => {
    await api
      .get('/api/behavior')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are 3 behaviors', async () => {
    const response = await api.get('/api/behavior').expect(200);
    assert.strictEqual(response.body.length, 3);
  });

  test('there is an activity Comportamiento con los hermanos', async () => {
    const response = await api.get('/api/behavior').expect(200);
    const activityNames = response.body.map((a) => a.activities.name);
    assert(activityNames.includes('Comportamiento con los hermanos'));
  });

  describe('adding a new behavior', () => {
    test('a valid behavior can be added', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: dataActivities } = await supabase
        .from('activities')
        .select();

      const { data: dataPeople } = await supabase
        .from('people')
        .select()
        .eq('name', 'Emiliano');

      const newBehavior = {
        person_id: dataPeople[0].id,
        date: '2024-11-02',
        behavior: 'positive',
        activity_id: dataActivities[2].id,
        user_id: user.id,
      };
      const response = await api
        .post('/api/behavior', newBehavior)
        .send(newBehavior)
        .expect(201);

      assert(response.body.length, behavior.set2.length + 1);
    });

    test('fails on missing behavior', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: dataActivities } = await supabase
        .from('activities')
        .select();

      const { data: dataPeople } = await supabase
        .from('people')
        .select()
        .eq('name', 'Emiliano');

      const newBehavior = {
        person_id: dataPeople[0].id,
        date: '2024-11-02',
        activity_id: dataActivities[0].id,
      };

      const response = await api
        .post('/api/behavior', newBehavior)
        .send(newBehavior)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'new row violates row-level security policy'
        )
      );
    });

    test('fails on duplicate row', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: dataActivities } = await supabase
        .from('activities')
        .select();

      const { data: dataPeople } = await supabase
        .from('people')
        .select()
        .eq('name', 'Emiliano');

      const newBehavior = {
        person_id: dataPeople[0].id,
        date: '2024-10-31',
        behavior: 'positive',
        activity_id: dataActivities[2].id,
        user_id: user.id,
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

    test('fails on unauthorized user', async () => {
      const {
        data: { user: oldUser },
      } = await supabase.auth.getUser();

      const { data: dataActivities } = await supabase
        .from('activities')
        .select();

      const { data: dataPeople } = await supabase
        .from('people')
        .select()
        .eq('name', 'Emiliano');

      const newBehavior = {
        person_id: dataPeople[0].id,
        date: '2024-11-01',
        behavior: 'positive',
        activity_id: dataActivities[2].id,
        user_id: oldUser.id,
      };

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });

      const response = await api
        .post('/api/behavior', newBehavior)
        .send(newBehavior)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'new row violates row-level security policy'
        )
      );
    });
  });

  describe('update behavior', () => {
    test('succeed with status code 201', async () => {
      const { data } = await supabase.from('behavior_tracking').select();
      const behaviorToUpdate = { behavior: 'positive' };
      const response = await api
        .put(`/api/behavior/${data[0].id}`, behaviorToUpdate)
        .send(behaviorToUpdate)
        .expect(201);

      assert.strictEqual(response.body[0].behavior, behaviorToUpdate.behavior);
    });

    test('fails on duplicate row', async () => {
      const { data } = await supabase.from('behavior_tracking').select();

      const behaviorToUpdate = { activity_id: data[2].activity_id };
      const response = await api
        .put(`/api/behavior/${data[0].id}`, behaviorToUpdate)
        .send(behaviorToUpdate)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'duplicate key value violates unique constraint'
        )
      );
    });

    test('fails on unauthorized user', async () => {
      const { data } = await supabase.from('behavior_tracking').select();
      await supabase.auth.signOut();
      await supabase.auth.signInWithPassword({
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });
      const behaviorToUpdate = { behavior: 'positive' };
      const response = await api
        .put(`/api/behavior/${data[0].id}`, behaviorToUpdate)
        .send(behaviorToUpdate)
        .expect(201);

      assert.equal(response.body.length, 0);
    });
  });

  describe('delete behavior', () => {
    test('succeed with status code 204', async () => {
      const { data: beforeDelete } = await supabase
        .from('behavior_tracking')
        .select();

      const response = await api
        .delete(`/api/behavior/${beforeDelete[0].id}`)
        .expect(204);
      const { data: afterDelete } = await supabase
        .from('behavior_tracking')
        .select();
      assert.equal(afterDelete.length, beforeDelete.length - 1);
    });

    test('fails on unauthorized user', async () => {
      const { data } = await supabase.from('behavior_tracking').select();
      await supabase.auth.signOut();
      await supabase.auth.signInWithPassword({
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });
      const response = await api
        .delete(`/api/behavior/${data[0].id}`)
        .expect(204);
    });
  });
});
