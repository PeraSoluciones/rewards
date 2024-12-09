const { test, beforeEach, describe, after } = require('node:test');
const supabase = require('../utils/connection');
const assert = require('node:assert');
const supertest = require('supertest');
const { activities } = require('../utils/list_activities');
const app = require('../app');

const api = supertest(app);

describe('when there is initially some activities saved', () => {
  beforeEach(async () => {
    const { error: truncateError } = await supabase.rpc('truncate_table', {
      table_name: 'activities',
    });

    if (truncateError) console.log(truncateError.message);

    const {
      data: { user: user1 },
    } = await supabase.auth.signInWithPassword({
      email: 'pabloaucapina2@hotmail.com',
      password: 'pera0609',
    });

    let _activities = activities.set1.map((a) => {
      a.user_id = user1.id;
      return a;
    });

    const { error: errorActivitiesSet1 } = await supabase
      .from('activities')
      .insert(_activities);

    if (errorActivitiesSet1) console.log(errorActivitiesSet1.message);

    await supabase.auth.signOut();

    const {
      data: { user: user2 },
    } = await supabase.auth.signInWithPassword({
      email: 'soluciones.pera@gmail.com',
      password: 'pera0609',
    });

    _activities = activities.set2.map((a) => {
      a.user_id = user2.id;
      return a;
    });

    const { error: errorActivitiesSet2 } = await supabase
      .from('activities')
      .insert(_activities);

    if (errorActivitiesSet2) console.log(errorActivitiesSet2.message);
  });

  test('activities are returned as json', async () => {
    await api
      .get('/api/activities')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are 3 activities for user 2', async () => {
    const response = await api.get('/api/activities');
    assert.strictEqual(response.body.length, 3);
  });

  test('the first activity is Comportamiento con los hermanos', async () => {
    const response = await api.get('/api/activities');
    const activities = response.body.map((a) => a.name);
    assert(activities.includes('Comportamiento con los hermanos'), true);
  });

  describe('addition of a new activity', () => {
    test('a valid activity can be added', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newActivity = {
        name: 'Comportamiento con los compañeros',
        description: 'ESCUELA',
        user_id: user.id,
      };

      const response = await api
        .post('/api/activities', newActivity)
        .send(newActivity)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const { data, error } = await supabase.from('activities').select();
      if (error) console.log(error.message);

      assert.strictEqual(data.length, activities.set2.length + 1);
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

      assert(
        response.body.err.message.includes(
          'new row violates row-level security policy'
        )
      );
    });

    test('fails on duplicate user and name', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newActivity = {
        name: 'Comportamiento con los hermanos',
        description: 'CASA',
        user_id: user.id,
      };
      const response = await api
        .post('/api/activities', newActivity)
        .send(newActivity)
        .expect(400);

      assert(response.body.err.message.includes('duplicate key value'));
    });

    test('fails on unauthorized user', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newActivity = {
        name: 'Obedece a los padres cuando hay visitas',
        description: 'CASA',
        user_id: user.id,
      };

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        // email: 'soluciones.pera@gmail.com',
        email: 'pabloaucapina2@gmail.com',
        password: 'pera0609',
      });

      const response = await api
        .post('/api/activities', newActivity)
        .send(newActivity)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'new row violates row-level security policy'
        )
      );
    });
  });

  describe('update activity', () => {
    test('succeeds with status 201', async () => {
      const activityUpdate = { name: 'Obedece a los padres y abuelos' };
      const { data, error } = await supabase.from('activities').select();
      const response = await api
        .put(`/api/activities/${data[0].id}`, activityUpdate)
        .send(activityUpdate)
        .expect(201);

      assert.strictEqual(activityUpdate.name, response.body[0].name);
    });

    test('fails on unauthorized user', async () => {
      const { data } = await supabase.from('activities').select();

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        // email: 'soluciones.pera@gmail.com',
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });

      const activityUpdate = {
        name: 'Obedece a los padres cuando hay visitas',
      };

      const response = await api
        .put(`/api/activities/${data[0].id}`, activityUpdate)
        .send(activityUpdate)
        .expect(201);

      assert.equal(response.body.length, 0);
    });
  });

  describe('delete activity', () => {
    test('succeeds with code 204', async () => {
      const { data: beforeDelete } = await supabase.from('activities').select();

      const response = await api
        .delete(`/api/activities/${beforeDelete[0].id}`)
        .expect(204);

      const { data: afterDelete } = await supabase.from('activities').select();

      assert.equal(afterDelete.length, beforeDelete.length - 1);
    });

    test('fails on unauthorized user', async () => {
      const { data: beforeAttempt } = await supabase
        .from('activities')
        .select();

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        // email: 'soluciones.pera@gmail.com',
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });

      const response = await api.delete(
        `/api/activities/${beforeAttempt[0].id}`
      );

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        // email: 'pabloaucapina2@hotmail.com',
        email: 'soluciones.pera@gmail.com',
        password: 'pera0609',
      });

      const { data: afterAttempt } = await supabase.from('activities').select();

      assert.equal(beforeAttempt.length, afterAttempt.length);
    });
  });
});

after(async () => {
  const { error } = await supabase.auth.signOut();
});
