
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dysicrevicwmltnvecct.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5c2ljcmV2aWN3bWx0bnZlY2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTgzMzMsImV4cCI6MjA4NTQzNDMzM30.PAVk-QCWgpCi8W1wP7KEN152--T2y4V96wgDXwLMe6Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
