import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bgimpnmevjsgtkcgxscj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaW1wbm1ldmpzZ3RrY2d4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzI2NTgsImV4cCI6MjA2MDQwODY1OH0.7Gf9mm0CD1K07akuas4ptbzJcQu9LtvgVkWput9JTFk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);