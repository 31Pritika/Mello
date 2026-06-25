import psycopg2

conn = psycopg2.connect(
    host="db.asjzmfqjbiutxxypppgj.supabase.co",
    user="postgres",
    password="Prisha310706",
    dbname="postgres",
    port=5432,
    sslmode="require"
)

print("Connected!")