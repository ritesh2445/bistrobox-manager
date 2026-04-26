import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wshhywjikevsfcstfvqj.supabase.co";
const SUPABASE_KEY = "sb_publishable_FJdvgBtJ6YUt1jxx32ztiw_vSXs8ehh";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ritesh2445m@gmail.com',
    password: 'Sree@2445'
  });

  if (authError) {
    console.error(authError);
    return;
  }

  const { data: schema, error: schemaError } = await supabase.rpc('get_table_columns', { table_name: 'waiter_requests' });

  // If RPC is missing, try a direct query to information_schema (if allowed) or just try an insert and log error
  console.log("Schema check via insert...");
  const { error: insertError } = await supabase.from("waiter_requests").insert([{
    table_number: 'TEST',
    guest_name: 'TEST',
    user_id: '304a6a43-330f-430f-a9c9-61ef896b6f6c'
  }]);

  console.log("Insert Error:", insertError);
}

test();
