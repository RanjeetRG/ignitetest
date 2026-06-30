from flask import Blueprint, jsonify
from database import AuditLog, User

audit_bp = Blueprint('audit', __name__, url_prefix='/api/audit')

@audit_bp.route('/', methods=['GET'])
def get_audit_logs():
    """Get all audit trail logs"""
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    results = []
    for l in logs:
        user = User.query.get(l.user_id) if l.user_id else None
        results.append({
            "id": l.id,
            "user_id": l.user_id,
            "username": user.username if user else "System/Anonymous",
            "action": l.action,
            "details": l.details,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return jsonify({"audit_logs": results}), 200
