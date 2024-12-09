const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert');
const supabase = require('../utils/connection');
const supertest = require('supertest');
const app = require('../app');
const { people } = require('../utils/list_people');

const api = supertest(app);
describe('when there are initially some people saved', () => {
  beforeEach(async () => {
    const { error } = await supabase.rpc('truncate_table', {
      table_name: 'people',
    });

    if (error) console.log(error.message);

    const {
      data: { user: user1 },
    } = await supabase.auth.signInWithPassword({
      email: 'pabloaucapina2@hotmail.com',
      password: 'pera0609',
    });

    let _people = people.set1.map((p) => {
      p.user_id = user1.id;
      return p;
    });

    const { error: errorPeopleSet1 } = await supabase
      .from('people')
      .insert(_people);

    if (errorPeopleSet1) console.log(errorPeopleSet1.message);

    await supabase.auth.signOut();

    const {
      data: { user: user2 },
    } = await supabase.auth.signInWithPassword({
      email: 'soluciones.pera@gmail.com',
      password: 'pera0609',
    });

    _people = people.set2.map((p) => {
      p.user_id = user2.id;
      return p;
    });

    const { error: errorPeopleSet2 } = await supabase
      .from('people')
      .insert(_people);

    if (errorPeopleSet2) console.log(errorPeopleSet2.message);
  });

  test('people are returned as json', async () => {
    await api
      .get('/api/people')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are two people', async () => {
    const response = await api.get('/api/people');
    assert.strictEqual(response.body.length, 2);
  });

  test('there is a person with a name Emiliano', async () => {
    const response = await api.get('/api/people');
    const peopleNames = response.body.map((p) => p.name);

    assert(peopleNames.includes('Emiliano'));
  });

  describe('addition of a new person', () => {
    test('a valid person can be added', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newPerson = {
        name: 'Juan Carlos',
        birth_date: '2010-02-27',
        user_id: user.id,
      };
      const response = await api
        .post('/api/people', newPerson)
        .send(newPerson)
        .expect(201);

      assert.strictEqual(newPerson.name, response.body[0].name);
    });

    test('fails on missing name', async () => {
      const newPerson = { birth_date: '2015-10-01' };
      const response = await api
        .post('/api/people', newPerson)
        .send(newPerson)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'new row violates row-level security policy'
        )
      );
    });

    test('fails on duplicate name', async () => {
      const newPerson = { name: 'Emiliano', birth_date: '2017-04-22' };
      const response = await api
        .post('/api/people', newPerson)
        .send(newPerson)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'new row violates row-level security policy'
        )
      );
    });

    test('fails on unauthorized user', async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newPerson = {
        name: 'Matias',
        birth_date: '2014-09-22',
        user_id: user.id,
      };

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });

      const response = await api
        .post('/api/people', newPerson)
        .send(newPerson)
        .expect(400);

      assert(
        response.body.err.message.includes(
          'new row violates row-level security'
        )
      );
    });
  });

  describe('update person', () => {
    test('succeeds with status 201', async () => {
      const { data } = await supabase.from('people').select();
      const personUpdate = { birth_date: '2018-01-01' };
      const response = await api
        .put(`/api/people/${data[0].id}`, personUpdate)
        .send(personUpdate)
        .expect(201);

      assert.strictEqual(response.body[0].birth_date, personUpdate.birth_date);
    });

    test('fails on update name - duplicate', async () => {
      const { data } = await supabase
        .from('people')
        .select()
        .eq('name', 'Isaac');

      const personUpdate = { name: 'Emiliano' };

      const response = await api
        .put(`/api/people/${data[0].id}`, personUpdate)
        .send(personUpdate)
        .expect(400);

      assert(response.body.err.message.includes('duplicate key value'));
    });

    test('fails on unauthorized user', async () => {
      const { data } = await supabase.from('people').select();

      const personUpdate = { birth_date: '2018-01-01' };

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });

      const response = await api
        .put(`/api/people/${data[0].id}`, personUpdate)
        .send(personUpdate)
        .expect(201);

      assert.equal(response.body.length, 0);
    });
  });

  describe('delete person', () => {
    test('succeed with status 204', async () => {
      const { data: beforeDelete } = await supabase.from('people').select();
      const response = await api.delete(`/api/people/${beforeDelete[0].id}`);
      const { data: afterDelete } = await supabase.from('people').select();
      assert.equal(afterDelete.length, beforeDelete.length - 1);
    });

    test('fails on unauthorized user', async () => {
      const { data: beforeAttempt } = await supabase.from('people').select();

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        // email: 'soluciones.pera@gmail.com',
        email: 'pabloaucapina2@hotmail.com',
        password: 'pera0609',
      });

      const response = await api.delete(`/api/people/${beforeAttempt[0].id}`);

      await supabase.auth.signOut();

      await supabase.auth.signInWithPassword({
        // email: 'pabloaucapina2@hotmail.com',
        email: 'soluciones.pera@gmail.com',
        password: 'pera0609',
      });

      const { data: afterAttempt } = await supabase.from('people').select();

      assert.equal(beforeAttempt.length, afterAttempt.length);
    });
  });
});
