#!/usr/bin/env python3
"""
Script to seed default certificate templates
Run this after starting the backend server
"""
import requests
import json

def seed_templates():
    url = 'http://localhost:5001/api/certificate-templates/seed'
    
    try:
        response = requests.post(url, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Success: {data['message']}")
            print(f"   Added {data.get('total_templates', 0)} templates")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend server")
        print("   Please make sure the backend server is running on http://localhost:5001")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    print("Seeding certificate templates...")
    seed_templates()
