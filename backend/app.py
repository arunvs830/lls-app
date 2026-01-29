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
    CORS(app, origins=[frontend_url, 'http://localhost:6001', 'http://localhost:3000'])

    db.init_app(app)
    
    # Register API routes
    register_routes(app)

    with app.app_context():
        db.create_all()

    return app

# For gunicorn production deployment
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 6000))
    debug = os.getenv('FLASK_ENV', 'development') != 'production'
    app.run(debug=debug, port=port)
