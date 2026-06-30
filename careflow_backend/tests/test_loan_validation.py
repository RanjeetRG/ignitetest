import unittest
import sys
import os

# Ensure backend parent directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from App import app, db
from database import User

class TestLoanValidationAndAPIs(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    def test_01_login_api(self):
        """Test login API with customer credentials"""
        res = self.app.post('/api/v1/auth/login', json={'username': 'customer', 'password': 'demo123'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['role'], 'customer')

    def test_02_apply_loan_success(self):
        """Test successfully applying for a loan"""
        res_login = self.app.post('/api/v1/auth/login', json={'username': 'customer', 'password': 'demo123'})
        token = res_login.get_json()['token']

        res = self.app.post('/api/v1/loans/apply', 
                            json={'amount': 15000, 'purpose': 'Business Expansion', 'monthly_income': 4500},
                            headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data['loan']['amount'], 15000)

    def test_03_customer_loan_list(self):
        """Test retrieving customer loan application list"""
        res_login = self.app.post('/api/v1/auth/login', json={'username': 'customer', 'password': 'demo123'})
        token = res_login.get_json()['token']

        res = self.app.get('/api/v1/loans/my-applications', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data['applications'], list)
        self.assertGreaterEqual(len(data['applications']), 1)

    def test_04_validation_missing_amount(self):
        """Test validation failure when loan amount is missing"""
        res_login = self.app.post('/api/v1/auth/login', json={'username': 'customer', 'password': 'demo123'})
        token = res_login.get_json()['token']

        # Missing amount key completely
        res = self.app.post('/api/v1/loans/apply', 
                            json={'purpose': 'Vehicle Purchase', 'monthly_income': 5000},
                            headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res.status_code, 400)
        self.assertIn("Missing loan amount", res.get_json()['error'])

        # Empty string amount
        res2 = self.app.post('/api/v1/loans/apply', 
                             json={'amount': '', 'purpose': 'Vehicle Purchase', 'monthly_income': 5000},
                             headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res2.status_code, 400)
        self.assertIn("Missing loan amount", res2.get_json()['error'])

    def test_05_validation_invalid_income(self):
        """Test validation failure when monthly income is negative or invalid"""
        res_login = self.app.post('/api/v1/auth/login', json={'username': 'customer', 'password': 'demo123'})
        token = res_login.get_json()['token']

        # Negative income
        res = self.app.post('/api/v1/loans/apply', 
                            json={'amount': 10000, 'purpose': 'Medical', 'monthly_income': -500},
                            headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res.status_code, 400)
        self.assertIn("Invalid monthly income: must be positive", res.get_json()['error'])

        # String non-numeric income
        res2 = self.app.post('/api/v1/loans/apply', 
                             json={'amount': 10000, 'purpose': 'Medical', 'monthly_income': 'five thousand'},
                             headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res2.status_code, 400)
        self.assertIn("Invalid monthly income: must be a number", res2.get_json()['error'])

    def test_06_validation_unauthorized_role(self):
        """Test validation failure when unauthorized role (e.g., doctor) tries to apply for a loan"""
        res_login = self.app.post('/api/v1/auth/login', json={'username': 'doctor', 'password': 'demo123'})
        token = res_login.get_json()['token']

        res = self.app.post('/api/v1/loans/apply', 
                            json={'amount': 50000, 'purpose': 'Equipment', 'monthly_income': 12000},
                            headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res.status_code, 403)
        self.assertIn("Customer role required", res.get_json()['error'])

if __name__ == '__main__':
    unittest.main()
