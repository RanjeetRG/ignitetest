from flask import request
from database import db, AuditLog

def log_action(user_id, action, details=None):
    try:
        ip = request.remote_addr if request else "system"
    except Exception:
        ip = "system"
    
    log = AuditLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip
    )
    db.session.add(log)
    db.session.commit()
