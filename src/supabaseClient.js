import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tmkyqunuqvptlphcshbp.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_4g8mi4xUpcgyFEuxcAOcYA_eIknZKLQ";

// Clean base project URL (removes trailing /rest/v1 if present) for standard Supabase SDK initialization
const supabaseProjectUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');

export const supabase = createClient(supabaseProjectUrl, SUPABASE_PUBLIC_KEY);

export { SUPABASE_URL, SUPABASE_PUBLIC_KEY };
export default supabase;
