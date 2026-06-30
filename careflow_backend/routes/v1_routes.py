import base64
from flask import Blueprint, request, jsonify, g
from database import db, User, LoanApplication
from utils.audit_helper import log_action
from utils.auth_helper import token_required, customer_role_required

v1_bp = Blueprint('v1', __name__, url_prefix='/api/v1')

@v1_bp.route('/auth/login', methods=['POST'])
def v1_login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        log_action(None, "FAILED_LOGIN_V1", f"Failed v1 login attempt for {username}")
        return jsonify({"error": "Invalid credentials"}), 401

    log_action(user.id, "USER_LOGGED_IN_V1", "Successful v1 login")

    # Generate token structured as user_id:username:role:secret
    token_raw = f"{user.id}:{user.username}:{user.role}:secret_token"
    token = base64.b64encode(token_raw.encode('utf-8')).decode('utf-8')

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200


@v1_bp.route('/loans/apply', methods=['POST'])
@token_required
@customer_role_required
def apply_loan():
    data = request.get_json() or {}
    amount = data.get('amount')
    purpose = data.get('purpose')
    monthly_income = data.get('monthly_income')

    if amount is None or str(amount).strip() == "":
        return jsonify({"error": "Missing loan amount"}), 400

    if purpose is None or str(purpose).strip() == "":
        return jsonify({"error": "Missing loan purpose"}), 400

    if monthly_income is None or str(monthly_income).strip() == "":
        return jsonify({"error": "Missing monthly income"}), 400

    try:
        amount_val = float(amount)
        if amount_val <= 0:
            return jsonify({"error": "Invalid loan amount: must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid loan amount: must be a number"}), 400

    try:
        income_val = float(monthly_income)
        if income_val <= 0:
            return jsonify({"error": "Invalid monthly income: must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid monthly income: must be a number"}), 400

    loan = LoanApplication(
        user_id=g.current_user.id,
        amount=amount_val,
        purpose=str(purpose).strip(),
        monthly_income=income_val,
        status='Pending Review'
    )
    db.session.add(loan)
    db.session.commit()

    log_action(g.current_user.id, "LOAN_APPLIED", f"Applied for loan ${amount_val} for {purpose}")

    return jsonify({
        "message": "Loan application submitted successfully",
        "loan": {
            "id": loan.id,
            "amount": loan.amount,
            "purpose": loan.purpose,
            "monthly_income": loan.monthly_income,
            "status": loan.status,
            "created_at": loan.created_at.isoformat() if loan.created_at else None
        }
    }), 201


@v1_bp.route('/loans/my-applications', methods=['GET'])
@token_required
@customer_role_required
def my_loan_applications():
    loans = LoanApplication.query.filter_by(user_id=g.current_user.id).order_by(LoanApplication.created_at.desc()).all()
    results = []
    for l in loans:
        results.append({
            "id": l.id,
            "amount": l.amount,
            "purpose": l.purpose,
            "monthly_income": l.monthly_income,
            "status": l.status,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return jsonify({
        "applications": results,
        "total_count": len(results)
    }), 200
