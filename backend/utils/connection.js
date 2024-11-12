const config = require('../utils/config');
const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

logger.info('Connecting to ', config.SUPABASE_URI);

const supabase = createClient(config.SUPABASE_URI, config.SUPABASE_KEY);

module.exports = supabase;
