# Supabase client configuration
from supabase import create_client, Client
from decouple import config

def get_supabase_client() -> Client:
    """
    Initialize and return Supabase client
    """
    url: str = config('SUPABASE_PROJECT_URL')
    key: str = config('SUPABASE_API_KEY')
    supabase_client: Client = create_client(url, key)
    return supabase_client