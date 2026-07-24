from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import mediapipe as mp
import time
import numpy as np
from auth import auth

app = Flask(__name__)
CORS(app)

# Register the auth blueprint
app.register_blueprint(auth, url_prefix='/auth')

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

def calculate_angle(a, b, c):
    """Calculate the angle between three points"""
    try:
        a = np.array([a.x, a.y])
        b = np.array([b.x, b.y])
        c = np.array([c.x, c.y])
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
        return angle
    except (AttributeError, TypeError):
        return None

def run_exercise_logic(landmarks, state):
    """
    Tracks exercises with proper form detection and feedback
    """
    mp_pose = mp.solutions.pose

    # Initialize state if None or ensure all required keys exist
    if state is None:
        state = {
            "count": 0,
            "errors": [],
            "stage": "down",
            "current_errors": [],
            "rep_feedback": {},
            "points": 0,
            "last_position": None,
            "last_angle": None,
            "movement_start_time": None,
            "movement_threshold": 0.02,
            "speed_threshold": 1.0  # seconds
        }
    
    # Ensure all required keys exist in state
    required_keys = [
        "count", "errors", "stage", "current_errors", "rep_feedback",
        "points", "last_position", "last_angle", "movement_start_time",
        "movement_threshold", "speed_threshold"
    ]
    
    for key in required_keys:
        if key not in state:
            if key in ["count", "points"]:
                state[key] = 0
            elif key in ["errors", "current_errors"]:
                state[key] = []
            elif key == "rep_feedback":
                state[key] = {}
            elif key == "stage":
                state[key] = "down"
            elif key in ["movement_threshold", "speed_threshold"]:
                state[key] = 0.02 if key == "movement_threshold" else 1.0
            else:
                state[key] = None

    try:
        # Get relevant landmarks based on exercise type
        if current_exercise == 'bicep_curls':
            # Bicep curl landmarks
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            left_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
            left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            right_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
            right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

            # Calculate angles
            left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)

            # Track movement speed
            current_time = time.time()
            if state["movement_start_time"] is None:
                state["movement_start_time"] = current_time

            # Check form
            if state["stage"] == "down":
                if left_angle < 90 and right_angle < 90:  # Arms bent
                    movement_duration = current_time - state["movement_start_time"]
                    
                    # Check if movement was too fast
                    if movement_duration < state["speed_threshold"]:
                        state["current_errors"].append("Moving too fast")
                    
                    state["stage"] = "up"
                    state["movement_start_time"] = current_time
                    
                    # Check elbow position (should be close to body)
                    if abs(left_elbow.x - left_shoulder.x) > state["movement_threshold"] or \
                       abs(right_elbow.x - right_shoulder.x) > state["movement_threshold"]:
                        state["current_errors"].append("Keep elbows close to body")

            elif state["stage"] == "up":
                if left_angle > 160 and right_angle > 160:  # Arms extended
                    movement_duration = current_time - state["movement_start_time"]
                    
                    # Check if movement was too fast
                    if movement_duration < state["speed_threshold"]:
                        state["current_errors"].append("Moving too fast")
                    
                    state["stage"] = "down"
                    state["movement_start_time"] = current_time
                    state["count"] += 1
                    
                    # Award points based on form
                    points_earned = 10  # Base points per rep
                    if not state["current_errors"]:
                        points_earned += 5  # Bonus for perfect form
                        state["rep_feedback"][state["count"]] = ["Perfect form! +15 points"]
                    else:
                        unique_errors = list(dict.fromkeys(state["current_errors"]))
                        state["rep_feedback"][state["count"]] = [f"{error} (-2 points)" for error in unique_errors]
                        points_earned -= len(unique_errors) * 2  # Deduct points for each error
                    
                    state["points"] += max(points_earned, 0)  # Ensure points don't go negative
                    state["current_errors"] = []

        elif current_exercise == 'squats':
            # Squat landmarks
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            left_knee = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
            left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
            right_knee = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
            right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]

            # Calculate angles
            left_angle = calculate_angle(left_hip, left_knee, left_ankle)
            right_angle = calculate_angle(right_hip, right_knee, right_ankle)

            # Track movement speed
            current_time = time.time()
            if state["movement_start_time"] is None:
                state["movement_start_time"] = current_time

            # Check form
            if state["stage"] == "up":
                if left_angle < 120 and right_angle < 120:  # Squat position
                    movement_duration = current_time - state["movement_start_time"]
                    
                    # Check if movement was too fast
                    if movement_duration < state["speed_threshold"]:
                        state["current_errors"].append("Moving too fast")
                    
                    # Check knee alignment
                    if left_knee.x < left_ankle.x or right_knee.x > right_ankle.x:
                        state["current_errors"].append("Keep knees aligned with feet")
                    
                    # Check depth
                    if left_angle > 100 or right_angle > 100:
                        state["current_errors"].append("Squat deeper")
                    
                    state["stage"] = "down"
                    state["movement_start_time"] = current_time

            elif state["stage"] == "down":
                if left_angle > 160 and right_angle > 160:  # Standing position
                    movement_duration = current_time - state["movement_start_time"]
                    
                    # Check if movement was too fast
                    if movement_duration < state["speed_threshold"]:
                        state["current_errors"].append("Moving too fast")
                    
                    state["stage"] = "up"
                    state["movement_start_time"] = current_time
                    state["count"] += 1
                    
                    # Award points based on form
                    points_earned = 10  # Base points per rep
                    if not state["current_errors"]:
                        points_earned += 5  # Bonus for perfect form
                        state["rep_feedback"][state["count"]] = ["Perfect form! +15 points"]
                    else:
                        unique_errors = list(dict.fromkeys(state["current_errors"]))
                        state["rep_feedback"][state["count"]] = [f"{error} (-2 points)" for error in unique_errors]
                        points_earned -= len(unique_errors) * 2  # Deduct points for each error
                    
                    state["points"] += max(points_earned, 0)  # Ensure points don't go negative
                    state["current_errors"] = []

        # Update errors list for current rep
        state["errors"] = list(dict.fromkeys(state["current_errors"]))

    except (IndexError, AttributeError, TypeError) as e:
        pass

    return state

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
    global cap, current_exercise, state, is_running

    if cap is None:
        cap = initialize_camera()
        if cap is None:
            return

    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            # Convert the BGR image to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process the image and get pose landmarks
            results = pose.process(image)
            
            # Convert back to BGR for OpenCV
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            if results.pose_landmarks:
                # Draw pose landmarks
                mp_drawing.draw_landmarks(
                    image, 
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
                )
                
                if is_running and current_exercise in ['bicep_curls', 'squats']:
                    global state
                    state = run_exercise_logic(results.pose_landmarks.landmark, state)
            
            # Encode the frame
            ret, buffer = cv2.imencode('.jpg', image)
            frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_exercise', methods=['POST'])
def start_exercise():
    global current_exercise, is_running, state
    data = request.json
    exercise_type = data.get('exercise')
    
    if exercise_type:
        current_exercise = exercise_type
        is_running = True
        state = {
            "count": 0,
            "errors": [],
            "stage": "down",
            "current_errors": [],
            "rep_feedback": {},
            "points": 0,
            "last_position": None,
            "last_angle": None,
            "movement_start_time": None,
            "movement_threshold": 0.02,
            "speed_threshold": 1.0  # seconds
        }
        return jsonify({"status": "success", "exercise": exercise_type})
    return jsonify({"status": "error", "message": "No exercise specified"})

@app.route('/stop_exercise', methods=['POST'])
def stop_exercise():
    global current_exercise, is_running, state
    current_exercise = None
    is_running = False
    state = None
    return jsonify({"status": "success"})

@app.route('/exercise_data')
def get_exercise_data():
    if state is None:
        return jsonify({
            "count": 0,
            "errors": [],
            "stage": "down",
            "rep_feedback": {},
            "points": 0
        })
    
    return jsonify({
        "count": state.get("count", 0),
        "errors": state.get("current_errors", []),
        "stage": state.get("stage", "down"),
        "rep_feedback": state.get("rep_feedback", {}),
        "points": state.get("points", 0)
    })

if __name__ == '__main__':
    app.run(debug=True)