const { activities } = require('../utils/list_activities');
const { people } = require('../utils/list_people');
const { behavior } = require('../utils/list_behavior');

const resetDB = async (supabase) => {
  await supabase.rpc('truncate_table', {
    table_name: 'activities',
  });
  await supabase.rpc('truncate_table', {
    table_name: 'people',
  });
  await supabase.rpc('truncate_table', {
    table_name: 'behavior_tracking',
  });

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

  const { data: dataSet1People, error: errorPeopleSet1 } = await supabase
    .from('people')
    .insert(_people)
    .select();

  if (errorPeopleSet1) console.log(errorPeopleSet1.message);

  let _activities = activities.set1.map((a) => {
    a.user_id = user1.id;
    return a;
  });

  const { data: dataSet1Activities, error: errorActivitiesSet1 } =
    await supabase.from('activities').insert(_activities).select();

  if (errorActivitiesSet1) console.log(errorActivitiesSet1.message);

  let _behavior = behavior.set1.map((b, i) => {
    b.person_id = dataSet1People[0].id;
    b.activity_id = dataSet1Activities[i % 5].id;
    b.user_id = user1.id;
    return b;
  });

  const { error: errorBehaviorSet1 } = await supabase
    .from('behavior_tracking')
    .insert(_behavior);

  if (errorBehaviorSet1) console.log(errorBehaviorSet1.message);

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

  const { data: dataSet2People, error: errorPeopleSet2 } = await supabase
    .from('people')
    .insert(_people)
    .select();

  if (errorPeopleSet2) console.log(errorPeopleSet2.message);

  _activities = activities.set2.map((a) => {
    a.user_id = user2.id;
    return a;
  });

  const { data: dataSet2Activities, error: errorActivitiesSet2 } =
    await supabase.from('activities').insert(_activities).select();

  if (errorActivitiesSet2) console.log(errorActivitiesSet2.message);

  _behavior = behavior.set2.map((b, i) => {
    b.person_id = dataSet2People[0].id;
    b.activity_id = dataSet2Activities[i % 3].id;
    b.user_id = user2.id;
    return b;
  });

  const { error: errorBehaviorSet2 } = await supabase
    .from('behavior_tracking')
    .insert(_behavior);

  if (errorBehaviorSet2) console.log(errorBehaviorSet2.message);
};

module.exports = { resetDB };
