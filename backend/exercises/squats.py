import mediapipe as mp
import time
import numpy as np

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
    except:
        return None

def run_exercise_logic(landmarks, state):
    """
    Tracks squats, focusing on knee stability, depth, and proper form.
    """
    mp_pose = mp.solutions.pose

    if state is None:
        state = {
            "count": 0,
            "errors": [],
            "stage": "up",
            "current_errors": [],
            "rep_feedback": {},
            "last_knee_distance": None,
            "last_hip_height": None,
            "downward_motion_start_time": None,
            "knee_positions": [],  # Stores past knee distances for smoothing
        }
    
    required_keys = [
        "last_knee_distance", "last_hip_height",
        "downward_motion_start_time", "knee_positions",
        "count", "errors", "stage", "current_errors", 
        "rep_feedback"
    ]
    
    for key in required_keys:
        if key not in state:
            if key == "count":
                state[key] = 0
            elif key in ["errors", "current_errors"]:
                state[key] = []
            elif key == "rep_feedback":
                state[key] = {}
            elif key == "stage":
                state[key] = "up"
            elif key == "knee_positions":
                state[key] = []
            else:
                state[key] = None

    try:
        # Get relevant landmarks for squat analysis
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        left_knee = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
        right_knee = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
        left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
        right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
        left_heel = landmarks[mp_pose.PoseLandmark.LEFT_HEEL.value]
        right_heel = landmarks[mp_pose.PoseLandmark.RIGHT_HEEL.value]
        right_foot = landmarks[mp_pose.PoseLandmark.RIGHT_FOOT_INDEX.value]
        left_foot = landmarks[mp_pose.PoseLandmark.LEFT_FOOT_INDEX.value]
        
        # Calculate angles for both legs
        left_leg_angle = calculate_angle(left_hip, left_knee, left_ankle)
        right_leg_angle = calculate_angle(right_hip, right_knee, right_ankle)
        
        if left_leg_angle is None or right_leg_angle is None:
            return state

        # Heel Lift Detection
        heel_y_threshold = 0.05
        if (left_heel.y < left_ankle.y - heel_y_threshold or
            right_heel.y < right_ankle.y - heel_y_threshold):
            error_msg = f"Rep {state['count']}: Heels lifting off ground"
            if error_msg not in state["current_errors"]:
                state["current_errors"].append(error_msg)

        # Improved Knee Over Toes Check (Now considers Z-depth as well)
        knee_over_toe_threshold = 0.08
        left_knee_forward = (left_knee.x > left_foot.x + knee_over_toe_threshold) 
        right_knee_forward = (right_knee.x > right_foot.x + knee_over_toe_threshold) 
        if left_knee_forward or right_knee_forward:
            error_msg = f"Rep {state['count']}: Knees moving too far forward"
            if error_msg not in state["current_errors"]:
                state["current_errors"].append(error_msg)

        # Knee Collapse Detection (More stable when turning sideways)
        knee_distance = abs(left_knee.x - right_knee.x)
        ankle_distance = abs(left_ankle.x - right_ankle.x)
        if knee_distance < (ankle_distance * 0.5):  # Adjusted threshold for more stability
            error_msg = f"Rep {state['count']}: Knees collapsing inward"
            if error_msg not in state["current_errors"]:
                state["current_errors"].append(error_msg)

                # Reset the timer and update stage for the next rep
                state["downward_motion_start_time"] = None
                state["stage"] = "up"


            elif state["stage"] == "down" and left_leg_angle > 160 and right_leg_angle > 160:
                # Reset the downward motion timer when standing back up
                state["downward_motion_start_time"] = None
                state["stage"] = "up"  # Reset stage for next rep


        # Smoothing knee position tracking
        state["knee_positions"].append(knee_distance)
        if len(state["knee_positions"]) > 5:  # Keep last 5 frames
            state["knee_positions"].pop(0)
        smoothed_knee_distance = np.mean(state["knee_positions"])

        state["last_knee_distance"] = smoothed_knee_distance

        # Rep Counting Logic
        legs_straight = left_leg_angle > 160 and right_leg_angle > 160
        legs_bent = left_leg_angle < 140 and right_leg_angle < 140

        if state["stage"] == "up" and legs_bent:
            state["stage"] = "down"
        
        if state["stage"] == "down" and legs_straight:
            state["stage"] = "up"
            state["count"] += 1

            # Store feedback for completed rep
            if len(state["current_errors"]) > 0:  # Check if there are any errors
                unique_errors = list(dict.fromkeys(state["current_errors"]))
                state["rep_feedback"][state["count"]] = unique_errors
            else:
                state["rep_feedback"][state["count"]] = [f"Rep {state['count']}: Perfect form!"]

            # Clear current errors for next rep
            state["current_errors"] = []

        # Update errors list for current rep
        state["errors"] = list(dict.fromkeys(state["current_errors"]))

    except Exception as e:
        print(f"Error in squats analysis: {str(e)}")

    return state
