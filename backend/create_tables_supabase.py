#!/usr/bin/env python
"""
Create tables using Supabase client instead of Django migrations
"""
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

try:
    from utils.supabase_client import get_supabase_client
    
    print("🔄 Creating basic tables using Supabase client...")
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    print("✅ Supabase client initialized!")
    
    # Create a simple test table first
    print("\n📋 Creating test table...")
    
    # SQL to create a basic users table (if not exists)
    create_users_table_sql = """
    CREATE TABLE IF NOT EXISTS custom_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(150) UNIQUE NOT NULL,
        email VARCHAR(254) UNIQUE NOT NULL,
        user_type VARCHAR(10) DEFAULT 'parent',
        phone_number VARCHAR(20),
        date_of_birth DATE,
        is_active BOOLEAN DEFAULT TRUE,
        is_staff BOOLEAN DEFAULT FALSE,
        is_superuser BOOLEAN DEFAULT FALSE,
        date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    try:
        # Execute SQL using Supabase RPC (if available) or direct query
        result = supabase.rpc('exec_sql', {'sql': create_users_table_sql}).execute()
        print("✅ Users table created successfully!")
        
    except Exception as e:
        print(f"⚠️  Direct SQL execution not available: {e}")
        print("💡 This is normal - Supabase may not allow direct SQL execution through the client")
        
    # Try to create table via Supabase dashboard
    print("\n📝 Alternative approach:")
    print("1. Go to your Supabase dashboard: https://supabase.com/dashboard")
    print("2. Navigate to SQL Editor")
    print("3. Run the following SQL to create the basic structure:")
    print("\n" + "="*50)
    print(create_users_table_sql)
    print("="*50)
    
    # Test if we can query existing tables
    print("\n🔍 Testing table access...")
    try:
        # Try to access a simple table
        response = supabase.table('custom_users').select('*').limit(1).execute()
        print("✅ Can access custom_users table!")
        
    except Exception as e:
        error_msg = str(e)
        if "does not exist" in error_msg:
            print("❌ Table doesn't exist yet - need to create it manually")
        else:
            print(f"⚠️  Table access error: {error_msg}")
    
    print("\n🎯 Summary:")
    print("✅ Supabase connection is working")
    print("❌ Direct table creation through client may be limited")
    print("💡 Recommended: Create tables manually in Supabase dashboard")
    
except Exception as e:
    print(f"❌ Error: {e}")
    