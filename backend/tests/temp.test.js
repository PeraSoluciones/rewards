const { test, beforeEach, describe, after, before } = require('node:test');
const supabase = require('../utils/connection');
const assert = require('node:assert');
const supertest = require('supertest');
const { activities } = require('../utils/list_activities');
const app = require('../app');

const api = supertest(app);

describe('Update activities', () => {
  //   beforeEach(async () => {
  //     const { data, error } = await supabase.rpc('truncate_table', {
  //       table_name: 'activities',
  //     });

  //     const {
  //       data: { user },
  //     } = await supabase.auth.signInWithPassword({
  //       email: 'pabloaucapina2@hotmail.com',
  //       password: 'pera0609',
  //     });

  //     let _activities = activities.map((a) => {
  //       a.user_id = user.id;
  //       return a;
  //     });

  //     if (error) console.log(error.message);
  //     const { errorActivities } = await supabase
  //       .from('activities')
  //       .insert(_activities);

  //     if (errorActivities) console.log(errorActivities.message);
  //   });

  test('succeed on authorized user', async () => {
    await supabase.auth.signInWithPassword({
      email: 'pabloaucapina2@hotmail.com',
      password: 'pera0609',
    });

    const activityUpdate = {
      name: 'Obedece a los padres cuando hay visitas',
    };

    const response = await api
      .put(
        `/api/activities/37c72a84-d849-4392-8a09-42dab01c50d0`,
        activityUpdate
      )
      .send(activityUpdate);

    assert(response.body[0].name.includes(activityUpdate.name));
  });

  test('fails on unauthorized user', async () => {
    await supabase.auth.signInWithPassword({
      email: 'soluciones.pera@gmail.com',
      password: 'pera0609',
    });

    const activityUpdate = {
      name: 'Obedece a los padres',
    };

    const response = await api
      .put(
        `/api/activities/37c72a84-d849-4392-8a09-42dab01c50d0`,
        activityUpdate
      )
      .send(activityUpdate);

    assert(response.body.length === 0);
  });
});

after(async () => {
  const { error } = await supabase.auth.signOut();
});
