#!/usr/bin/env python3
"""
Lion Rocket Development Runner
Manages both frontend and backend services using UV
"""
import os
import sys
import subprocess
import signal
import time
from pathlib import Path
import argparse
from typing import List, Optional

class ServiceManager:
    def __init__(self):
        self.processes: List[subprocess.Popen] = []
        self.root_dir = Path(__file__).parent
        
    def handle_signal(self, signum, frame):
        """Handle shutdown signals gracefully"""
        print("\n🛑 Shutting down services...")
        self.stop_all()
        sys.exit(0)
        
    def start_backend(self, host: str = "0.0.0.0", port: int = 8000):
        """Start the backend server"""
        print("🚀 Starting backend server...")
        backend_dir = self.root_dir / "backend"
        venv_dir = backend_dir / ".venv"
        
        # Change to backend directory for UV commands
        original_cwd = os.getcwd()
        os.chdir(backend_dir)
        
        try:
            # Create virtual environment if it doesn't exist
            if not venv_dir.exists():
                print("📦 Creating backend virtual environment...")
                subprocess.run(["uv", "venv"], check=True)
                
            # Install dependencies
            print("📦 Installing backend dependencies...")
            subprocess.run(["uv", "pip", "install", "-r", "requirements.txt"], check=True)
            subprocess.run(["uv", "pip", "install", "-e", "."], check=True)
            
            # Use the virtual environment's Python
            if sys.platform == "win32":
                python_path = venv_dir / "Scripts" / "python.exe"
            else:
                python_path = venv_dir / "bin" / "python"
                
            cmd = [
                str(python_path), "-m", "uvicorn", "app.main:app",
                "--reload",
                "--host", host,
                "--port", str(port)
            ]
            
            process = subprocess.Popen(
                cmd,
                env={**os.environ, "PYTHONPATH": str(backend_dir)}
            )
            self.processes.append(process)
            print(f"✅ Backend running at http://{host}:{port}")
            return process
        finally:
            os.chdir(original_cwd)
        
    def start_frontend(self):
        """Start the frontend development server"""
        print("🎨 Starting frontend server...")
        frontend_dir = self.root_dir / "frontend"
        
        # Check if node_modules exists
        if not (frontend_dir / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir
        )
        self.processes.append(process)
        print("✅ Frontend running at http://localhost:5173")
        return process
        
    def stop_all(self):
        """Stop all running processes"""
        for process in self.processes:
            if process.poll() is None:  # Process is still running
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        self.processes.clear()
        
    def run_all(self):
        """Run both frontend and backend services"""
        # Set up signal handlers
        signal.signal(signal.SIGINT, self.handle_signal)
        signal.signal(signal.SIGTERM, self.handle_signal)
        
        try:
            # Start services
            backend = self.start_backend()
            time.sleep(2)  # Give backend time to start
            frontend = self.start_frontend()
            
            print("\n✨ All services are running!")
            print("📖 API Docs: http://localhost:8000/docs")
            print("🌐 Frontend: http://localhost:5173")
            print("\nPress Ctrl+C to stop all services\n")
            
            # Wait for processes
            while True:
                # Check if any process has died
                for process in self.processes:
                    if process.poll() is not None:
                        print(f"⚠️  A service has stopped unexpectedly!")
                        self.stop_all()
                        sys.exit(1)
                time.sleep(1)
                
        except Exception as e:
            print(f"❌ Error: {e}")
            self.stop_all()
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Lion Rocket Development Runner")
    parser.add_argument(
        "command",
        choices=["dev", "install", "test", "format", "lint"],
        help="Command to run"
    )
    parser.add_argument("--backend-only", action="store_true", help="Run backend only")
    parser.add_argument("--frontend-only", action="store_true", help="Run frontend only")
    
    args = parser.parse_args()
    manager = ServiceManager()
    
    if args.command == "dev":
        if args.backend_only:
            manager.start_backend()
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                manager.stop_all()
        elif args.frontend_only:
            manager.start_frontend()
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                manager.stop_all()
        else:
            manager.run_all()
            
    elif args.command == "install":
        print("Installing dependencies...")
        # Install backend dependencies with UV
        backend_dir = manager.root_dir / "backend"
        os.chdir(backend_dir)
        subprocess.run(["uv", "venv"], check=False)  # Create venv if needed
        subprocess.run(["uv", "pip", "install", "-r", "requirements.txt"])
        subprocess.run(["uv", "pip", "install", "-e", "."])
        os.chdir(manager.root_dir)
        
        # Install frontend dependencies
        try:
            subprocess.run(["npm", "install"], 
                          cwd=manager.root_dir / "frontend", 
                          check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Warning: npm not found or failed. Skipping frontend dependencies.")
        print("Dependencies installed!")
        
    elif args.command == "test":
        print("Running tests...")
        # Run backend tests
        subprocess.run(["pytest"], cwd=manager.root_dir / "backend")
        # Run frontend tests if they exist
        if (manager.root_dir / "tests").exists():
            subprocess.run(["npm", "test"], cwd=manager.root_dir / "tests")
            
    elif args.command == "format":
        print("🎨 Formatting code...")
        # Format backend
        subprocess.run(["black", "app", "--line-length", "100"], 
                      cwd=manager.root_dir / "backend")
        # Format frontend
        subprocess.run(["npx", "prettier", "--write", "src/**/*.{ts,vue,js}"], 
                      cwd=manager.root_dir / "frontend")
        print("✅ Code formatted!")
        
    elif args.command == "lint":
        print("🔍 Linting code...")
        # Lint backend
        subprocess.run(["ruff", "check", "app"], 
                      cwd=manager.root_dir / "backend")
        # Type check frontend
        subprocess.run(["npm", "run", "type-check"], 
                      cwd=manager.root_dir / "frontend")

# Entry point functions for console scripts
def dev_main():
    """Entry point for 'uv run dev' command"""
    sys.argv = ["run.py", "dev"]
    main()

def install_main():
    """Entry point for 'uv run install' command"""
    sys.argv = ["run.py", "install"]
    main()

def test_main():
    """Entry point for 'uv run test' command"""
    sys.argv = ["run.py", "test"]
    main()

def format_main():
    """Entry point for 'uv run format' command"""
    sys.argv = ["run.py", "format"]
    main()

def lint_main():
    """Entry point for 'uv run lint' command"""
    sys.argv = ["run.py", "lint"]
    main()

if __name__ == "__main__":
    main()