// Script to update a user's password using Supabase Admin API
// Usage: node scripts/update-password.js
// Requires SUPABASE_SERVICE_ROLE_KEY environment variable

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nSet these in your terminal before running:');
  console.error('$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const EMAIL = 'akin.anenih@sdkoncept.com';
const NEW_PASSWORD = '!1Jason2013';

async function updatePassword() {
  console.log(`Looking up user: ${EMAIL}...`);
  
  // First, get the user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }
  
  const user = users.users.find(u => u.email === EMAIL);
  
  if (!user) {
    console.error(`User not found: ${EMAIL}`);
    process.exit(1);
  }
  
  console.log(`Found user: ${user.id}`);
  console.log(`Updating password...`);
  
  // Update the user's password
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: NEW_PASSWORD
  });
  
  if (error) {
    console.error('Error updating password:', error.message);
    process.exit(1);
  }
  
  console.log(`✓ Password updated successfully for ${EMAIL}`);
}

updatePassword();


