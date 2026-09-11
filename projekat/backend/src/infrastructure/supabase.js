'use strict';

const { createClient } = require('@supabase/supabase-js');

const isConfigured =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = isConfigured
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

module.exports = supabase;
