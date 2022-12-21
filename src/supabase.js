

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fcyihitsdkuvjkualdga.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeWloaXRzZGt1dmprdWFsZGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzA5NTE5NzksImV4cCI6MTk4NjUyNzk3OX0.v5cMQLhcy5BJSUUmUuQlNylDfwhr0JItiGUVYZY7qso";
const supabase = createClient(supabaseUrl, supabaseKey)


export default supabase; 