require('dotenv').config();

const PORT = process.env.PORT;
const SUPABASE_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_SUPABASE_URI
    : process.env.SUPABASE_URI;
const SUPABASE_KEY =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_SUPABASE_KEY
    : process.env.SUPABASE_KEY;

module.exports = {
  PORT,
  SUPABASE_URI,
  SUPABASE_KEY,
};
