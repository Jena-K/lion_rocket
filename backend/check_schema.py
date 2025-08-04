import sqlite3
import os

# Connect to the database
db_path = os.path.join("data", "lionrocket.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("Database Tables and their Foreign Keys:")
print("=" * 50)

for table in tables:
    table_name = table[0]
    if table_name.startswith('sqlite_'):
        continue
        
    print(f"\nTable: {table_name}")
    print("-" * 30)
    
    # Get table info
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    for col in columns:
        col_id, col_name, col_type, not_null, default, pk = col
        pk_text = " (PRIMARY KEY)" if pk else ""
        print(f"  {col_name} - {col_type}{pk_text}")
    
    # Get foreign keys
    cursor.execute(f"PRAGMA foreign_key_list({table_name})")
    fks = cursor.fetchall()
    
    if fks:
        print("  Foreign Keys:")
        for fk in fks:
            print(f"    {fk[3]} -> {fk[2]}.{fk[4]}")

conn.close()