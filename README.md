# FormAI

Real-time exercise form feedback powered by computer vision.

## What It Does
FormAI tracks movement patterns during workouts through a standard webcam feed. Instead of recording video for manual review later, the app analyzes joint angles on the fly, flags bad reps instantly, and logs form trends across workouts.

## Key Features
* **Live Joint Tracking:** Runs an inference pipeline built with OpenCV and MediaPipe to detect keypoints and monitor joint angles.
* **Real-Time Corrections:** Calculates rep form accuracy live, hitting an 88% pose-detection benchmark.
* **Low-Latency Feedback:** Hyperparameters and frame processing are tuned in Python so feedback triggers without distracting video lag.
* **Performance Logs:** A React interface gives users a straightforward view of form scores and rep stats over time.

## Tech Stack
* **CV Pipeline:** OpenCV, MediaPipe
* **Backend:** Python
* **Frontend:** React.js
