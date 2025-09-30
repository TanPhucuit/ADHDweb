#!/usr/bin/env python
"""
Test direct PostgreSQL connection to Supabase
"""
import psycopg2
from decouple import config

def test_db_connection():
    try:
        print("🔄 Testing direct PostgreSQL connection to Supabase...")
        
        # Get database credentials from .env
        db_name = config('DB_NAME')
        db_user = config('DB_USER')
        db_password = config('DB_PASSWORD')
        db_host = config('DB_HOST')
        db_port = config('DB_PORT')
        
        print(f"📍 Host: {db_host}")
        print(f"📍 Port: {db_port}")
        print(f"📍 Database: {db_name}")
        print(f"📍 User: {db_user}")
        
        # Test connection
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            sslmode='require'
        )
        
        print("✅ Database connection successful!")
        
        # Test query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print(f"📊 PostgreSQL version: {db_version[0]}")
        
        # Check existing tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print(f"📋 Existing tables ({len(tables)}):")
        for table in tables[:10]:  # Show first 10 tables
            print(f"  - {table[0]}")
        if len(tables) > 10:
            print(f"  ... and {len(tables) - 10} more tables")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        print("\n🔧 Possible solutions:")
        print("1. Check if the database password is correct")
        print("2. Verify the database host and port")
        print("3. Make sure the database exists")
        print("4. Check if your IP is whitelisted in Supabase")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_db_connection()