from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db, bcrypt, User, Appointment, AuditLog, LoanApplication
from routes.auth_routes import auth_bp
from routes.appointment_routes import appointment_bp
from routes.audit_routes import audit_bp
from routes.v1_routes import v1_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
bcrypt.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(appointment_bp)
app.register_blueprint(audit_bp)
app.register_blueprint(v1_bp)

def seed_demo_data():
    """Seed initial user accounts and demo loan applications"""
    if User.query.filter_by(username='patient').first() is None:
        patient = User(username='patient', email='patient@careflow.com', role='patient')
        patient.set_password('demo123')

        doctor = User(username='doctor', email='doctor@careflow.com', role='doctor')
        doctor.set_password('demo123')

        receptionist = User(username='receptionist', email='receptionist@careflow.com', role='receptionist')
        receptionist.set_password('demo123')

        db.session.add_all([patient, doctor, receptionist])
        db.session.commit()

    customer = User.query.filter_by(username='customer').first()
    if customer is None:
        customer = User(username='customer', email='customer@finance.com', role='customer')
        customer.set_password('demo123')
        db.session.add(customer)
        db.session.commit()

        demo_loan = LoanApplication(
            user_id=customer.id,
            amount=25000.0,
            purpose='Home Renovation & Solar Panels',
            monthly_income=6500.0,
            status='Approved'
        )
        db.session.add(demo_loan)
        db.session.commit()
        print("Demo customer and loan application seeded.")
        print("Demo data seeded (patient, doctor, receptionist, customer + demo loan).")

# Create tables & seed accounts within application context
with app.app_context():
    db.create_all()
    seed_demo_data()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CareFlow Hospital Queue Engine",
        "message": "Backend service is running, blueprints registered, and clinic queue initialized."
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
