"""Check what tables exist in the database"""
import sqlite3
from pathlib import Path

db_path = Path("data/lionrocket.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = cursor.fetchall()

print("Existing tables:")
for table in tables:
    print(f"  - {table[0]}")
    
# Check if chats table exists and its structure
if any(t[0] == 'chats' for t in tables):
    print("\nChats table structure:")
    cursor.execute("PRAGMA table_info(chats)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
elif any(t[0] == 'messages' for t in tables):
    print("\nMessages table structure:")
    cursor.execute("PRAGMA table_info(messages)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")

conn.close()