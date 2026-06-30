from flask import Blueprint, request, jsonify
from database import db, Appointment, User
from utils.audit_helper import log_action
from datetime import datetime

appointment_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

@appointment_bp.route('/my/<int:patient_id>', methods=['GET'])
def get_my_appointments(patient_id):
    """Patient Portal: Get appointment history and queue status"""
    appts = Appointment.query.filter_by(patient_id=patient_id).order_by(Appointment.created_at.desc()).all()
    results = []
    for a in appts:
        results.append({
            "id": a.id,
            "department": a.department,
            "doctor_name": a.doctor_name,
            "appointment_date": a.appointment_date,
            "queue_number": a.queue_number,
            "symptoms": a.symptoms,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
    return jsonify({"appointments": results}), 200


@appointment_bp.route('/book', methods=['POST'])
def book_appointment():
    """Patient Portal: Book an appointment and assign daily queue number"""
    data = request.get_json() or {}
    patient_id = data.get('patient_id')
    department = data.get('department')
    doctor_name = data.get('doctor_name')
    appointment_date = data.get('appointment_date')
    symptoms = data.get('symptoms')

    if not all([patient_id, department, doctor_name, appointment_date, symptoms]):
        return jsonify({"error": "Missing required appointment fields"}), 400

    # Calculate next queue number for the department/day
    existing_count = Appointment.query.filter_by(department=department, appointment_date=appointment_date).count()
    queue_number = existing_count + 1

    appt = Appointment(
        patient_id=patient_id,
        department=department,
        doctor_name=doctor_name,
        appointment_date=appointment_date,
        queue_number=queue_number,
        symptoms=symptoms,
        status='waiting'
    )
    db.session.add(appt)
    db.session.commit()

    log_action(patient_id, "APPOINTMENT_BOOKED", f"Booked {department} Queue #{queue_number} with {doctor_name}")

    return jsonify({
        "message": "Appointment booked successfully",
        "appointment": {
            "id": appt.id,
            "department": appt.department,
            "doctor_name": appt.doctor_name,
            "queue_number": appt.queue_number,
            "status": appt.status
        }
    }), 201


@appointment_bp.route('/queue', methods=['GET'])
def get_active_queue():
    """Staff Command Center: Get active patient queue"""
    appts = Appointment.query.order_by(Appointment.status == 'in_consultation', Appointment.queue_number.asc()).all()
    results = []
    for a in appts:
        patient = User.query.get(a.patient_id)
        results.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": patient.username if patient else "Unknown Patient",
            "patient_email": patient.email if patient else "Unknown Email",
            "department": a.department,
            "doctor_name": a.doctor_name,
            "appointment_date": a.appointment_date,
            "queue_number": a.queue_number,
            "symptoms": a.symptoms,
            "status": a.status
        })
    return jsonify({"queue": results}), 200


@appointment_bp.route('/<int:appt_id>/status', methods=['PUT'])
def update_appointment_status(appt_id):
    """Staff Command Center: Update consultation status"""
    data = request.get_json() or {}
    staff_id = data.get('staff_id')
    new_status = data.get('status') # 'in_consultation', 'completed', 'cancelled'

    if new_status not in ['in_consultation', 'completed', 'cancelled']:
        return jsonify({"error": "Invalid status update"}), 400

    appt = Appointment.query.get(appt_id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    old_status = appt.status
    appt.status = new_status
    db.session.commit()

    log_action(staff_id, "QUEUE_STATUS_UPDATED", f"Appt #{appt.id} (Queue #{appt.queue_number}) changed to {new_status}")

    return jsonify({
        "message": f"Appointment #{appt.id} status updated to {new_status}",
        "appointment": {"id": appt.id, "status": appt.status}
    }), 200
