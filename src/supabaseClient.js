// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wnbmwyskndyfieammleg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYm13eXNrbmR5ZmllYW1tbGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTg3MjIsImV4cCI6MjA0NTY5NDcyMn0.NH3vei68j7UyGC5ewbQ-e0gmj440B2HMqGqeOC7qVWk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
