import numpy as np
import mediapipe as mp
import time

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
    Tracks bicep curls, focusing on swinging and movement speed.
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
            "last_left_elbow_x": None,
            "last_left_elbow_y": None,
            "last_right_elbow_x": None,
            "last_right_elbow_y": None,
            "last_swing_error_time": None,
            "downward_motion_start_time": None,
            "swinging": False
        }
    
    # Ensure all required keys exist in state
    required_keys = [
        "last_left_elbow_x", "last_left_elbow_y",
        "last_right_elbow_x", "last_right_elbow_y",
        "last_swing_error_time", "downward_motion_start_time",
        "swinging", "count", "errors", "stage",
        "current_errors", "rep_feedback"
    ]
    
    for key in required_keys:
        if key not in state:
            if key in ["count", "swinging"]:
                state[key] = 0 if key == "count" else False
            elif key in ["errors", "current_errors"]:
                state[key] = []
            elif key == "rep_feedback":
                state[key] = {}
            elif key == "stage":
                state[key] = "down"
            else:
                state[key] = None

    try:
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        left_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        right_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        # Get current elbow positions for swinging detection
        left_current_x, left_current_y = left_elbow.x, left_elbow.y
        right_current_x, right_current_y = right_elbow.x, right_elbow.y

        # Check for swinging using both arms
        swinging = False
        if state["last_left_elbow_x"] is not None and state["last_left_elbow_y"] is not None:
            left_delta_x = abs(left_current_x - state["last_left_elbow_x"])
            left_delta_y = abs(left_current_y - state["last_left_elbow_y"])
            if left_delta_x > 0.025 or left_delta_y > 0.025:
                swinging = True

        if state["last_right_elbow_x"] is not None and state["last_right_elbow_y"] is not None:
            right_delta_x = abs(right_current_x - state["last_right_elbow_x"])
            right_delta_y = abs(right_current_y - state["last_right_elbow_y"])
            if right_delta_x > 0.025 or right_delta_y > 0.025:
                swinging = True

        # Update the last elbow positions
        state["last_left_elbow_x"] = left_current_x
        state["last_left_elbow_y"] = left_current_y
        state["last_right_elbow_x"] = right_current_x
        state["last_right_elbow_y"] = right_current_y

        # Add swinging error if detected
        if swinging:
            error_msg = f"Rep {state['count']}: Swinging"
            if error_msg not in state["current_errors"]:  # Avoid duplicates
                state["current_errors"].append(error_msg)
                state["errors"] = list(dict.fromkeys(state["current_errors"]))  # Update current display

        # Calculate angles for both arms
        left_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
        right_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
        if left_angle is None or right_angle is None:
            return state

        # Check for downward motion speed
        arms_up = left_angle > 160 or right_angle > 160
        arms_transitioning_down = (left_angle < 110 or right_angle < 110)

        if not arms_up and arms_transitioning_down:
            if state["downward_motion_start_time"] is None:
                state["downward_motion_start_time"] = time.time()
        else:
            if state["downward_motion_start_time"] is not None:
                motion_duration = time.time() - state["downward_motion_start_time"]
                if motion_duration < 0.6:
                    error_msg = f"Rep {state['count']}: Moving too fast"
                    if error_msg not in state["current_errors"]:  # Avoid duplicates
                        state["current_errors"].append(error_msg)
                        state["errors"] = list(dict.fromkeys(state["current_errors"]))  # Update current display
                state["downward_motion_start_time"] = None

        # Rep counting logic
        if state["stage"] == "down" and (left_angle > 160 or right_angle > 160):
            state["stage"] = "up"
        
        if state["stage"] == "up" and (left_angle < 60 and right_angle < 60):
            state["stage"] = "down"
            state["count"] += 1
            
            # Store feedback for completed rep
            if state["current_errors"]:
                unique_errors = list(dict.fromkeys(state["current_errors"]))
                state["rep_feedback"][state["count"]] = unique_errors
            else:
                state["rep_feedback"][state["count"]] = [f"Rep {state['count']}: Perfect form!"]
            
            state["current_errors"] = []

        # Update errors list for current rep
        state["errors"] = list(dict.fromkeys(state["current_errors"]))

    except (IndexError, AttributeError, TypeError) as e:
        pass

    return state
