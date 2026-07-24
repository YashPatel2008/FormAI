from flask import Flask
from flask_cors import CORS
from auth import auth
import cv2
import mediapipe as mp
import numpy as np
from flask import jsonify, request
import base64
import time
from exercises.bicepcurl import run_exercise_logic as bicep_curl_logic
from exercises.squats import run_exercise_logic as squats_logic
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register the auth blueprint
app.register_blueprint(auth, url_prefix='/auth')

# MongoDB setup
client = MongoClient(os.getenv('MONGO_URI'))
db = client.formAI
workout_history = db.workout_history

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils

# Global variables
cap = None
current_exercise = None
state = None
is_running = False

def initialize_camera():
    global cap
    if cap is not None:
        cap.release()
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return None
    return cap

def generate_frames():
    global current_exercise, is_running, state, cap
    
    if cap is None:
        cap = cv2.VideoCapture(0)
    
    while True:
        success, frame = cap.read()
        if not success:
            break
        
        # Convert the BGR image to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame and get landmarks
        results = pose.process(frame_rgb)
        
        if results.pose_landmarks and is_running:
            landmarks = results.pose_landmarks.landmark
            
            # Run exercise-specific logic
            if current_exercise == 'bicep_curl':
                state = bicep_curl_logic(landmarks, state)
            elif current_exercise == 'squats':
                state = squats_logic(landmarks, state)
        
        # Draw the pose annotation on the frame
        frame_rgb = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame_rgb,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS
            )
        
        # Encode the frame
        ret, buffer = cv2.imencode('.jpg', frame_rgb)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/start_exercise', methods=['POST'])
def start_exercise():
    global current_exercise, is_running, state
    data = request.json
    exercise_type = data.get('exercise')
    
    if exercise_type in ['bicep_curl', 'squats']:
        current_exercise = exercise_type
        is_running = True
        
        # Base state
        state = {
            "count": 0,
            "errors": [],
            "stage": "up",
            "current_errors": [],
            "rep_feedback": {},
        }
        
        # Exercise-specific state additions
        if exercise_type == 'bicep_curl':
            state.update({
                "last_left_shoulder_y": None,
                "last_right_shoulder_y": None,
                "last_movement_time": None
            })
        elif exercise_type == 'squats':
            state.update({
                "last_knee_distance": None,
                "last_hip_height": None,
                "downward_motion_start_time": None,
                "knee_wobble": False
            })
            
        return jsonify({"status": "success", "exercise": exercise_type})
    return jsonify({"status": "error", "message": "Invalid exercise type"})

@app.route('/stop_exercise', methods=['POST'])
def stop_exercise():
    global current_exercise, is_running, state
    
    if state is None:
        return jsonify({
            "status": "success",
            "summary": {
                "total_reps": 0,
                "total_errors": 0,
                "rep_feedback": [],
                "score": 0,
                "exercise_type": current_exercise
            }
        })

    total_reps = state["count"]
    
    # Convert rep_feedback from object to array format
    rep_feedback = []
    total_errors = 0
    
    for rep in range(1, total_reps + 1):
        errors = state["rep_feedback"].get(rep, [])
        total_errors += len(errors)
        if errors:
            for error in errors:
                rep_feedback.append(error)
        else:
            rep_feedback.append(f"Rep {rep}: Perfect form!")
    
    # Calculate score
    score = max(0, 100 - ((total_errors / total_reps * 100) if total_reps > 0 else 0))
    
    summary = {
        "total_reps": total_reps,
        "total_errors": total_errors,
        "score": round(score, 2),
        "rep_feedback": rep_feedback,
        "exercise_type": current_exercise
    }
    
    # Save workout data to database
    workout_data = {
        "user_id": "user_id",
        "date": time.time(),
        "exercise_type": current_exercise,
        "total_reps": total_reps,
        "total_errors": total_errors,
        "score": round(score, 2),
        "rep_feedback": rep_feedback
    }
    workout_history.insert_one(workout_data)
    
    # Clear state
    current_exercise = None
    is_running = False
    state = None
    
    return jsonify({"status": "success", "summary": summary})

@app.route('/workout_history', methods=['GET'])
def get_workout_history():
    try:
        # Get user's workout history
        history = list(workout_history.find(
            {"user_id": "user_id"},
            {"_id": 0}  # Exclude MongoDB _id from results
        ).sort("date", -1))  # Sort by date descending
        
        return jsonify({
            "status": "success",
            "history": history
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/exercise_data')
def get_exercise_data():
    if state is None:
        return jsonify({
            "count": 0,
            "errors": [],
            "suggestions": []
        })
    
    return jsonify({
        "count": state.get("count", 0),
        "errors": state.get("current_errors", []),
        "stage": state.get("stage", "up")
    })

def calculate_angle(a, b, c):
    """
    Calculate the angle between three points
    Args:
        a: First point [x, y]
        b: Mid point [x, y]
        c: End point [x, y]
    Returns:
        angle: Angle in degrees
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360-angle
        
    return angle

def process_frame(frame):
    global state
    if not state:
        return frame

    # Convert the frame to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)

    if results.pose_landmarks:
        # Get coordinates
        shoulder = [results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].x,
                   results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        elbow = [results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW].x,
                 results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW].y]
        wrist = [results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST].x,
                results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST].y]

        # Calculate angle
        angle = calculate_angle(shoulder, elbow, wrist)

        # Check for swinging
        current_shoulder_y = shoulder[1]
        if state["last_shoulder_y"] is not None:
            shoulder_movement = abs(current_shoulder_y - state["last_shoulder_y"])
            if shoulder_movement > 0.02:  # Threshold for shoulder movement
                if "Swinging" not in state["current_errors"]:
                    state["current_errors"].append("Swinging")
        state["last_shoulder_y"] = current_shoulder_y

        # Count reps without displaying on frame
        if angle > 160:
            if state["stage"] == "up":
                state["count"] += 1
                state["rep_feedback"][state["count"]] = state["current_errors"].copy()
                state["current_errors"] = []
            state["stage"] = "down"
        
        if angle < 90:
            state["stage"] = "up"

    return frame

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)
