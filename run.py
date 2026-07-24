import subprocess
import sys
import os
import time
import webbrowser

def run_servers():
    # Start Flask backend
    flask_process = subprocess.Popen([sys.executable, 'backend/main.py'],
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)
    
    # Use npm from the standard Windows installation location
    npm_path = r"C:\Program Files\nodejs\npm.cmd"  # or "C:\Program Files (x86)\nodejs\npm.cmd"
    
    if not os.path.exists(npm_path):
        raise FileNotFoundError(f"npm not found at {npm_path}. Please verify Node.js installation.")
    
    # Start React frontend
    os.chdir('frontend')
    npm_process = subprocess.Popen([npm_path, 'start'],
                                 cwd='./frontend',  # Adjust this path as needed
                                 shell=True)
    
    # Wait a few seconds for servers to start
    time.sleep(5)
    
    # Open the application in the default browser
    webbrowser.open('http://localhost:3000')
    
    try:
        # Keep the script running
        flask_process.wait()
        npm_process.wait()
    except KeyboardInterrupt:
        # Handle cleanup when Ctrl+C is pressed
        flask_process.terminate()
        npm_process.terminate()
        print("\nServers stopped.")

if __name__ == "__main__":
    run_servers() 