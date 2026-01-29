from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import register_routes
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:6001')
    
    # Allow local development and production domains
    origins = [
        frontend_url, 
        'http://localhost:6001', 
        'http://localhost:3000',
        'https://lls-app.vercel.app',  # Explicitly add your Vercel domain
        'https://lls-app-git-main-arunvs830s-projects.vercel.app' # Preview deployments
    ]
    
    CORS(app, origins=origins, supports_credentials=True)

    db.init_app(app)
    
    # Register API routes
    register_routes(app)

    with app.app_context():
        db.create_all()
        
        # Auto-create admin if not exists (for deployments with no shell access)
        from models import Admin
        from werkzeug.security import generate_password_hash
        
        try:
            if not Admin.query.filter_by(username="admin").first():
                print("👤 Auto-creating default 'admin' user...")
                admin = Admin(
                    username="admin",
                    email="admin@lls.edu",
                    password_hash=generate_password_hash("admin123"),
                    full_name="System Administrator",
                    phone="0000000000"
                )
                db.session.add(admin)
                db.session.commit()
                print("✅ Default admin created: admin / admin123")
        except Exception as e:
            print(f"⚠️ Admin creation skipped: {e}")

    return app

# For gunicorn production deployment
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 6000))
    debug = os.getenv('FLASK_ENV', 'development') != 'production'
    app.run(debug=debug, port=port)
