"""Test character access after removing ownership check"""
import asyncio
import httpx

async def test_character_access():
    """Test accessing a character created by a different user"""
    async with httpx.AsyncClient() as client:
        # First, login as admin (user_id: 11)
        print("1. Logging in as admin...")
        login_response = await client.post(
            "http://localhost:8001/auth/login",
            json={
                "username": "admin",
                "password": "lemonT104!"
            }
        )
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.status_code} - {login_response.text}")
            return
            
        auth_data = login_response.json()
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print(f"✅ Logged in as admin (user_id: {auth_data['user']['user_id']})")
        
        # Try to access character 1 (created by user 1)
        print("\n2. Accessing character 1 (created by user 1)...")
        char_response = await client.get(
            "http://localhost:8001/characters/1",
            headers=headers
        )
        
        print(f"Status: {char_response.status_code}")
        if char_response.status_code == 200:
            character = char_response.json()
            print(f"✅ Successfully accessed character: {character['name']} (id: {character['character_id']})")
        else:
            print(f"❌ Failed to access character: {char_response.text}")
            
        # Try to select the character
        print("\n3. Selecting character 1...")
        select_response = await client.post(
            "http://localhost:8001/characters/1/select",
            headers=headers
        )
        
        print(f"Status: {select_response.status_code}")
        if select_response.status_code == 200:
            print("✅ Successfully selected character!")
        else:
            print(f"❌ Failed to select character: {select_response.text}")

if __name__ == "__main__":
    asyncio.run(test_character_access())