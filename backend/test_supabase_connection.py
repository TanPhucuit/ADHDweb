#!/usr/bin/env python
"""
Test Supabase connection script
"""
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard_backend.settings')

try:
    from utils.supabase_client import get_supabase_client
    from decouple import config
    
    print("🔄 Testing Supabase connection...")
    print(f"📍 Project URL: {config('SUPABASE_PROJECT_URL')}")
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    print("✅ Supabase client initialized successfully!")
    
    # Test basic connection by trying to get auth users (this will test API key)
    try:
        # Simple test query - check if we can access the database
        response = supabase.table('auth.users').select('*').limit(1).execute()
        print("✅ Database connection successful!")
        print(f"📊 Response status: {response.status_code if hasattr(response, 'status_code') else 'OK'}")
        
    except Exception as db_error:
        print(f"⚠️  Database query test failed: {str(db_error)}")
        print("Note: This might be normal if you don't have read permissions on auth.users table")
        
        # Try a simpler test - just check if the client can make requests
        try:
            # Test with a non-existent table to see if we get a proper error response
            response = supabase.table('test_connection').select('*').limit(1).execute()
        except Exception as simple_test_error:
            error_message = str(simple_test_error)
            if "relation" in error_message and "does not exist" in error_message:
                print("✅ API connection works! (Got expected 'table does not exist' error)")
            else:
                print(f"❌ API connection failed: {error_message}")
                
    print("\n🎯 Connection test completed!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all required packages are installed")
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("Please check your .env file configuration")