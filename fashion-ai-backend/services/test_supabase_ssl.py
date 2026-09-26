import ssl
import unittest

from services import supabase_service


class SupabaseSSLTests(unittest.TestCase):
    def test_build_httpx_client_uses_certifi_trust_store(self):
        client = supabase_service._build_httpx_client()
        self.assertIsInstance(client._transport._pool._ssl_context, ssl.SSLContext)
        self.assertIsNot(client._transport._pool._ssl_context, False)
        client.close()
