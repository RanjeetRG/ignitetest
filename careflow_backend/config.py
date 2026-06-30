import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # MySQL Configuration
    MYSQL_USER     = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'root1234')
    MYSQL_HOST     = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT     = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_DB       = os.environ.get('MYSQL_DB', 'careflow_db')

    SQLALCHEMY_DATABASE_URI = (
        os.environ.get('DATABASE_URL') or
        f"mysql+pymysql://root:root1234@localhost:3306/careflow_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
