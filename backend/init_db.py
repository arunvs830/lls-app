from app import create_app, db

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables defined in models.py
        db.create_all()
        print("Database initialized successfully using SQLAlchemy models.")

if __name__ == '__main__':
    init_db()
