"""
Script to create the initial Admin user safely in production.
Run this on Render using: python create_admin.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, Admin
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Check if admin already exists
    admin = Admin.query.filter_by(username="admin").first()
    
    if admin:
        print("✅ Admin user 'admin' already exists.")
    else:
        print("👤 Creating 'admin' user...")
        new_admin = Admin(
            username="admin",
            email="admin@lls.edu",
            password_hash=generate_password_hash("admin123"),
            full_name="System Administrator",
            phone="0000000000"
        )
        db.session.add(new_admin)
        db.session.commit()
        print("✅ Admin user created successfully!")
        print("Username: admin")
        print("Password: admin123")
