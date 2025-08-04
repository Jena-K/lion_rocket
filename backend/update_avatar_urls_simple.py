#!/usr/bin/env python3
"""
Simple script to update avatar_url values in characters table
Format: {character_id}_{YYYYMMDDHHMMSS}
"""
import sqlite3
from datetime import datetime
import os

def update_avatar_urls():
    """Update all avatar_url values in characters table"""
    
    # Database path
    db_path = "data/lionrocket.db"
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Error: Database file '{db_path}' not found!")
        return
    
    # Get current timestamp in YYYYMMDDHHMMSS format
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    print(f"Database: {db_path}")
    print(f"Timestamp: {timestamp}")
    print("-" * 50)
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # First, let's check current avatar_url values
        cursor.execute("SELECT character_id, name, avatar_url FROM characters ORDER BY character_id")
        characters = cursor.fetchall()
        
        print(f"\nFound {len(characters)} characters")
        print("\nCurrent avatar_url values:")
        for char_id, name, avatar_url in characters:
            print(f"  ID {char_id}: {name:15} -> {avatar_url}")
        
        # Update each character's avatar_url
        print(f"\nUpdating to timestamp: {timestamp}")
        print("-" * 50)
        
        updated_count = 0
        for char_id, name, old_url in characters:
            new_avatar_url = f"{char_id}_{timestamp}"
            cursor.execute(
                "UPDATE characters SET avatar_url = ? WHERE character_id = ?",
                (new_avatar_url, char_id)
            )
            print(f"  Updated ID {char_id}: {name:15} -> {new_avatar_url}")
            updated_count += 1
        
        # Commit changes
        conn.commit()
        
        print(f"\nSuccessfully updated {updated_count} characters")
        
        # Verify updates
        print("\nVerifying updates...")
        cursor.execute("SELECT character_id, name, avatar_url FROM characters ORDER BY character_id")
        updated_characters = cursor.fetchall()
        
        print("\nFinal avatar_url values:")
        for char_id, name, avatar_url in updated_characters:
            print(f"  ID {char_id}: {name:15} -> {avatar_url}")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    update_avatar_urls()