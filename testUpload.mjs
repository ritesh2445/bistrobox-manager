import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUpload() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'adminatbistro@gmail.com',
    password: 'Bistro123'
  });
  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }
  console.log('Logged in successfully', authData.user.id);
  
  const file = fs.readFileSync('test.png');
  const { data, error } = await supabase.storage.from('menu-images').upload(`test_${Date.now()}.png`, file, {
    contentType: 'image/png'
  });
  
  if (error) {
    console.error('Upload Error:', error);
  } else {
    console.log('Upload success:', data);
  }
}

testUpload();
