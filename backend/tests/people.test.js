const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert');
const supabase = require('../utils/connection');
const supertest = require('supertest');
const app = require('../app');
const { people } = require('../utils/list_people');

const api = supertest(app);
describe('when there are initially some people saved', () => {
  beforeEach(async () => {
    const { data, error } = await supabase.rpc('truncate_table', {
      table_name: 'people',
    });

    if (error) console.log(error.message);

    const { dataPeople, errorPeople } = await supabase
      .from('people')
      .insert(people);

    if (error) console.log(errorPeople);
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

  test('there is a person with a name Pablo Yahir', async () => {
    const response = await api.get('/api/people');
    const peopleNames = response.body.map((p) => p.name);

    assert(peopleNames.includes('Pablo Yahir'));
  });

  describe('addition of a new person', () => {
    test('a valid person can be added', async () => {
      const newPerson = { name: 'Juan Carlos', birth: '2010-02-27' };
      const response = await api
        .post('/api/people', newPerson)
        .send(newPerson)
        .expect(201);

      assert.strictEqual(newPerson.name, response.body[0].name);
    });

    test('fails on missing name', async () => {
      const newPerson = { birth: '2015-10-01' };
      const response = await api
        .post('/api/people', newPerson)
        .send(newPerson)
        .expect(400);

      assert(response.body.err.message.includes('null value in column "name"'));
    });

    test('fails on duplicate name', async () => {
      const newPerson = { name: 'Pablo Yahir', birth: '2018-06-09' };
      const response = await api
        .post('/api/people', newPerson)
        .send(newPerson)
        .expect(400);

      assert(response.body.err.message.includes('duplicate key value'));
    });
  });

  describe('update person', () => {
    test('succeeds with status 201', async () => {
      const personUpdate = { birth: '2018-01-01' };
      const response = await api
        .put('/api/people/1', personUpdate)
        .send(personUpdate)
        .expect(201);

      assert.strictEqual(response.body[0].birth, personUpdate.birth);
    });

    test('fails on update name - duplicate', async () => {
      const personUpdate = { name: 'Pablo Yahir' };
      const response = await api
        .put('/api/people/2', personUpdate)
        .send(personUpdate)
        .expect(400);

      assert(response.body.err.message.includes('duplicate key value'));
    });
  });

  describe('delete person', () => {
    test('succeed with status 204', async () => {
      const response = await api.delete('/api/people/1').expect(204);
    });
  });
});
