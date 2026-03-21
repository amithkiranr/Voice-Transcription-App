from supabase import create_client

# ✅ Wrap values in quotes
SUPABASE_URL = "https://pvnaetkpfqvnzbovzcsw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bmFldGtwZnF2bnpib3Z6Y3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTk1MjcsImV4cCI6MjA4OTMzNTUyN30.2lwGpC4gYxbrF-v3cAUOUIgoYQw26OA3oqWQGyif_q8"

# ✅ Create client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("URL:", SUPABASE_URL)