import os
import sys
from sqlalchemy import text, inspect

# Adjust path to import app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app import create_app, db

app = create_app()

def run_migration():
    """
    Applies necessary database migrations manually within the Flask app context.
    """
    with app.app_context():
        try:
            with db.engine.connect() as connection:
                inspector = inspect(db.engine)
                columns_in_contents = [col['name'] for col in inspector.get_columns('contents')]
                columns_in_templates = [col['name'] for col in inspector.get_columns('templates')]

                transaction = connection.begin()
                try:
                    # Migration for 'contents' table
                    if 'associated_media' not in columns_in_contents:
                        print("Running migration to add 'associated_media' column to 'contents' table...")
                        connection.execute(text("""
                            ALTER TABLE contents ADD COLUMN associated_media JSONB;
                        """))
                        print("'associated_media' column added.")

                    # Migrations for 'templates' table
                    if 'name' in columns_in_templates and 'template_name' not in columns_in_templates:
                        print("Running migration to rename 'name' to 'template_name' in 'templates' table...")
                        connection.execute(text("""
                            ALTER TABLE templates RENAME COLUMN name TO template_name;
                        """))
                        print("'template_name' column renamed.")
                    
                    if 'description' not in columns_in_templates:
                        print("Running migration to add 'description' column to 'templates' table...")
                        connection.execute(text("""
                            ALTER TABLE templates ADD COLUMN description TEXT;
                        """))
                        print("'description' column added.")

                    transaction.commit()
                    print("Migration successful!")
                except Exception as e:
                    transaction.rollback()
                    print(f"An error occurred during migration: {e}")
        except Exception as e:
            print(f"Failed to get database connection: {e}")

if __name__ == '__main__':
    run_migration() 