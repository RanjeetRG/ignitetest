from flask import Blueprint, request, jsonify
from database import db, User
from utils.audit_helper import log_action

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'patient') # 'patient', 'doctor', 'receptionist'

    if not all([username, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Username or email already exists"}), 409

    user = User(username=username, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    log_action(user.id, "USER_REGISTERED", f"Registered role {role}")

    import base64
    token_raw = f"{user.id}:{user.username}:{user.role}:secret_token"
    token = base64.b64encode(token_raw.encode('utf-8')).decode('utf-8')

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role}
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        log_action(None, "FAILED_LOGIN", f"Failed attempt for {username}")
        return jsonify({"error": "Invalid credentials"}), 401

    log_action(user.id, "USER_LOGGED_IN", "Successful login")

    # Generate a basic bearer token for localStorage
    import base64
    token_raw = f"{user.id}:{user.username}:{user.role}:secret_token"
    token = base64.b64encode(token_raw.encode('utf-8')).decode('utf-8')

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role}
    }), 200
