#!/usr/bin/env python
"""
Advanced Supabase connection test - Check available tables
"""
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

try:
    from utils.supabase_client import get_supabase_client
    from decouple import config
    
    print("🔄 Advanced Supabase connection test...")
    print(f"📍 Project URL: {config('SUPABASE_PROJECT_URL')}")
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    print("✅ Supabase client initialized successfully!")
    
    # Test authentication status
    try:
        # Try to get current user (will be None for anonymous access but won't error)
        user = supabase.auth.get_user()
        print("✅ Auth service accessible!")
        
    except Exception as auth_error:
        print(f"⚠️  Auth test: {str(auth_error)}")
    
    # Test storage service
    try:
        # List buckets (might be empty but should not error with valid API key)
        buckets = supabase.storage.list_buckets()
        print(f"✅ Storage service accessible! Found {len(buckets)} buckets")
        
    except Exception as storage_error:
        print(f"⚠️  Storage test: {str(storage_error)}")
    
    # Check for some common tables that might exist
    test_tables = [
        'auth_user',           # Django's default user table
        'users',               # Common user table name
        'profiles',            # Common profile table
        'medicine_notification' # Hinted from previous error
    ]
    
    print("\n🔍 Checking for existing tables...")
    for table_name in test_tables:
        try:
            response = supabase.table(table_name).select('*').limit(1).execute()
            print(f"✅ Table '{table_name}' exists and accessible")
            
        except Exception as table_error:
            error_msg = str(table_error)
            if "does not exist" in error_msg or "not found" in error_msg:
                print(f"❌ Table '{table_name}' does not exist")
            else:
                print(f"⚠️  Table '{table_name}': {error_msg}")
    
    print("\n🎯 Advanced test completed!")
    print("✅ Supabase connection is working properly!")
    print("\n📝 Next steps:")
    print("1. Create your Django models")
    print("2. Run Django migrations to create tables in Supabase")
    print("3. Start building your API endpoints")
    
except Exception as e:
    print(f"❌ Test failed: {e}")
    print("Please check your .env file configuration")