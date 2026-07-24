from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
import sqlite3
import os
import json

auth = Blueprint('auth', __name__)

# Initialize SQLite database
def init_db():
    db_path = os.path.join(os.path.dirname(__file__), 'formai.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Create users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fitness_level TEXT DEFAULT 'beginner',
            workout_frequency INTEGER DEFAULT 3,
            fitness_goals TEXT DEFAULT 'general_fitness',
            workout_data TEXT DEFAULT '{}'
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

def get_db():
    db_path = os.path.join(os.path.dirname(__file__), 'formai.db')
    return sqlite3.connect(db_path)

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        try:
            data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
            db = get_db()
            cursor = db.cursor()
            cursor.execute('SELECT * FROM users WHERE id = ?', (data['user_id'],))
            user = cursor.fetchone()
            db.close()
            
            if not user:
                return jsonify({'error': 'User not found'}), 401
                
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    return decorated

@auth.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    fitness_level = data.get('fitness_level', 'beginner')
    workout_frequency = data.get('workout_frequency', 3)
    fitness_goals = data.get('fitness_goals', 'general_fitness')

    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    db = get_db()
    cursor = db.cursor()
    
    try:
        hashed_password = generate_password_hash(password)
        cursor.execute(
            'INSERT INTO users (username, email, password, fitness_level, workout_frequency, fitness_goals) VALUES (?, ?, ?, ?, ?, ?)',
            (username, email, hashed_password, fitness_level, workout_frequency, fitness_goals)
        )
        db.commit()
        user_id = cursor.lastrowid
        
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, 'your-secret-key', algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'fitness_level': fitness_level,
                'workout_frequency': workout_frequency,
                'fitness_goals': fitness_goals
            }
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 400
    finally:
        db.close()

@auth.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    db.close()

    if user and check_password_hash(user[3], password):
        token = jwt.encode({
            'user_id': user[0],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, 'your-secret-key', algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'fitness_level': user[5],
                'workout_frequency': user[6],
                'fitness_goals': user[7],
                'workout_data': json.loads(user[8])
            }
        }), 200
    
    return jsonify({'error': 'Invalid username or password'}), 401

@auth.route('/profile', methods=['GET'])
@auth_required
def get_profile():
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1]
    data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (data['user_id'],))
    user = cursor.fetchone()
    db.close()
    
    return jsonify({
        'user': {
            'id': user[0],
            'username': user[1],
            'email': user[2],
            'fitness_level': user[5],
            'workout_frequency': user[6],
            'fitness_goals': user[7],
            'workout_data': json.loads(user[8])
        }
    }), 200

@auth.route('/profile', methods=['PUT'])
@auth_required
def update_profile():
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1]
    data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
    
    update_data = request.json
    updates = []
    values = []
    
    if 'username' in update_data:
        updates.append('username = ?')
        values.append(update_data['username'])
    
    if 'email' in update_data:
        updates.append('email = ?')
        values.append(update_data['email'])
    
    if 'password' in update_data and update_data['password']:
        updates.append('password = ?')
        values.append(generate_password_hash(update_data['password']))

    if 'fitness_level' in update_data:
        updates.append('fitness_level = ?')
        values.append(update_data['fitness_level'])
    
    if 'workout_frequency' in update_data:
        updates.append('workout_frequency = ?')
        values.append(update_data['workout_frequency'])
    
    if 'fitness_goals' in update_data:
        updates.append('fitness_goals = ?')
        values.append(update_data['fitness_goals'])
    
    if not updates:
        return jsonify({'error': 'No updates provided'}), 400
    
    values.append(data['user_id'])
    
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            f'UPDATE users SET {", ".join(updates)} WHERE id = ?',
            tuple(values)
        )
        db.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 400
    finally:
        db.close()

@auth.route('/save_workout', methods=['POST'])
@auth_required
def save_workout():
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1]
    user_data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
    
    workout_data = request.json
    exercise_type = workout_data.get('exercise_type')
    reps = workout_data.get('reps')
    accuracy = workout_data.get('accuracy')
    errors = workout_data.get('errors', {})
    date = workout_data.get('date')

    if not all([exercise_type, reps is not None, accuracy is not None, date]):
        return jsonify({'error': 'Missing workout data'}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        # Get current workout data
        cursor.execute('SELECT workout_data FROM users WHERE id = ?', (user_data['user_id'],))
        current_data = json.loads(cursor.fetchone()[0])
        
        # Initialize workout data for exercise if not exists
        if exercise_type not in current_data:
            current_data[exercise_type] = []
        
        # Add new workout session
        current_data[exercise_type].append({
            'date': date,
            'reps': reps,
            'accuracy': accuracy,
            'errors': errors
        })
        
        # Save updated workout data
        cursor.execute(
            'UPDATE users SET workout_data = ? WHERE id = ?',
            (json.dumps(current_data), user_data['user_id'])
        )
        db.commit()
        
        return jsonify({
            'message': 'Workout data saved successfully',
            'workout_data': current_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
