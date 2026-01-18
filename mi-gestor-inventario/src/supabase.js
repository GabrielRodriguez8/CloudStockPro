import { createClient } from '@supabase/supabase-js'

// Reemplaza esto con TU URL de Supabase (la que empieza por https://...)
const supabaseUrl = 'https://zwjofqmjnhdnhgxwebsq.supabase.co'

// Reemplaza esto con TU llave "anon public" (es una cadena larga de letras y números)
const supabaseKey = 'sb_publishable_SgTfkLIcv6kLUzt2Qj52jA_U0eVnXkL'

export const supabase = createClient(supabaseUrl, supabaseKey)