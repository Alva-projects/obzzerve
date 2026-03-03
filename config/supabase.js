import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rpxlynzeffxcbrwpyfpq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zbM4wURbUKJNv3BpSu0sKA_O52nr-0l";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
