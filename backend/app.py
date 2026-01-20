from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import register_routes
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend (allow all for dev)
    CORS(app)

    db.init_app(app)
    
    # Register API routes
    register_routes(app)

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 6000))
    app.run(debug=True, port=port)

