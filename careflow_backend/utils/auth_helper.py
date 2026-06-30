import base64
from functools import wraps
from flask import request, jsonify, g
from database import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'x-access-token' in request.headers:
            token = request.headers.get('x-access-token')

        if not token:
            return jsonify({'error': 'Token is missing or invalid'}), 401

        try:
            # Decode base64 token
            decoded = base64.b64decode(token.encode('utf-8')).decode('utf-8')
            parts = decoded.split(':')
            if len(parts) >= 3:
                user_id = int(parts[0])
                user = User.query.get(user_id)
                if not user:
                    return jsonify({'error': 'User not found'}), 401
                g.current_user = user
            else:
                return jsonify({'error': 'Invalid token format'}), 401
        except Exception as e:
            return jsonify({'error': 'Token validation failed', 'details': str(e)}), 401

        return f(*args, **kwargs)
    return decorated


def customer_role_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = getattr(g, 'current_user', None)
        if not user or user.role not in ['customer', 'patient']:
            return jsonify({'error': 'Access denied: Customer role required'}), 403
        return f(*args, **kwargs)
    return decorated
