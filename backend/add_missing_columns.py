"""Add missing columns to chats table"""
import sqlite3
from pathlib import Path

db_path = Path("data/lionrocket.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Add token_cost column
    cursor.execute("ALTER TABLE chats ADD COLUMN token_cost INTEGER DEFAULT 0")
    print("Added token_cost column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("token_cost column already exists")
    else:
        raise

try:
    # Add last_chat_at column
    cursor.execute("ALTER TABLE chats ADD COLUMN last_chat_at DATETIME")
    print("Added last_chat_at column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("last_chat_at column already exists")
    else:
        raise

conn.commit()
conn.close()
print("Database updates complete!")