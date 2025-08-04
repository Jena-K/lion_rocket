#!/usr/bin/env python3
"""Check current avatar_url values in the database"""
import sqlite3

conn = sqlite3.connect("data/lionrocket.db")
cursor = conn.cursor()

cursor.execute("SELECT character_id, name, avatar_url FROM characters ORDER BY character_id")
characters = cursor.fetchall()

print("Current avatar_url values in database:")
print("-" * 60)
print(f"{'ID':<5} {'Name':<20} {'Avatar URL':<30}")
print("-" * 60)

for char_id, name, avatar_url in characters:
    # Handle potential encoding issues
    try:
        name_display = name if name else "N/A"
    except:
        name_display = "???"
    
    print(f"{char_id:<5} {name_display:<20} {avatar_url:<30}")

conn.close()