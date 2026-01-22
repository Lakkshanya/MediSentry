import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to default 'postgres' database
        con = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='Lakk$hanya1995',
            host='localhost',
            port='5433'
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'medisentry_db'")
        exists = cur.fetchone()
        
        if not exists:
            print("Creating database 'medisentry_db'...")
            cur.execute('CREATE DATABASE medisentry_db')
            print("Database created successfully.")
        else:
            print("Database 'medisentry_db' already exists.")
            
        cur.close()
        con.close()
        
    except Exception as e:
        print(f"Error checking/creating database: {e}")

if __name__ == "__main__":
    create_database()
