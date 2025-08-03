#!/usr/bin/env python
"""
Backend Management Script
Provides common management commands for the backend
"""
import sys
import subprocess
from pathlib import Path
import argparse

def run_command(cmd: list[str], check: bool = True):
    """Run a command and handle errors"""
    try:
        result = subprocess.run(cmd, check=check)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        return False

def install_deps():
    """Install all dependencies"""
    print("📦 Installing dependencies...")
    run_command(["uv", "pip", "install", "-r", "requirements.txt"])
    run_command(["uv", "pip", "install", "-e", "."])
    run_command(["uv", "pip", "install", "--dev"])
    print("✅ Dependencies installed")

def run_tests():
    """Run tests"""
    print("🧪 Running tests...")
    venv_python = ".venv/Scripts/python.exe" if sys.platform == "win32" else ".venv/bin/python"
    run_command([venv_python, "-m", "pytest"])

def run_lint():
    """Run linting"""
    print("🔍 Running linters...")
    venv_dir = ".venv/Scripts" if sys.platform == "win32" else ".venv/bin"
    
    # Run ruff
    ruff_cmd = Path(venv_dir) / ("ruff.exe" if sys.platform == "win32" else "ruff")
    if ruff_cmd.exists():
        run_command([str(ruff_cmd), "check", "app"])
    
    # Run mypy
    mypy_cmd = Path(venv_dir) / ("mypy.exe" if sys.platform == "win32" else "mypy")
    if mypy_cmd.exists():
        run_command([str(mypy_cmd), "app"])

def run_format():
    """Format code"""
    print("🎨 Formatting code...")
    venv_dir = ".venv/Scripts" if sys.platform == "win32" else ".venv/bin"
    
    # Run black
    black_cmd = Path(venv_dir) / ("black.exe" if sys.platform == "win32" else "black")
    if black_cmd.exists():
        run_command([str(black_cmd), "app", "--line-length", "100"])
    
    # Run ruff fix
    ruff_cmd = Path(venv_dir) / ("ruff.exe" if sys.platform == "win32" else "ruff")
    if ruff_cmd.exists():
        run_command([str(ruff_cmd), "check", "--fix", "app"])

def create_migration(message: str):
    """Create a new migration"""
    print(f"📝 Creating migration: {message}")
    venv_alembic = ".venv/Scripts/alembic.exe" if sys.platform == "win32" else ".venv/bin/alembic"
    run_command([venv_alembic, "revision", "--autogenerate", "-m", message])

def run_migrations():
    """Run database migrations"""
    print("🗄️ Running migrations...")
    venv_alembic = ".venv/Scripts/alembic.exe" if sys.platform == "win32" else ".venv/bin/alembic"
    run_command([venv_alembic, "upgrade", "head"])

def main():
    parser = argparse.ArgumentParser(description="Backend management commands")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Install command
    subparsers.add_parser("install", help="Install all dependencies")
    
    # Test command
    subparsers.add_parser("test", help="Run tests")
    
    # Lint command
    subparsers.add_parser("lint", help="Run linting")
    
    # Format command
    subparsers.add_parser("format", help="Format code")
    
    # Migration commands
    migrate_parser = subparsers.add_parser("migrate", help="Run migrations")
    migrate_parser.add_argument("--create", help="Create a new migration with message")
    
    args = parser.parse_args()
    
    if args.command == "install":
        install_deps()
    elif args.command == "test":
        run_tests()
    elif args.command == "lint":
        run_lint()
    elif args.command == "format":
        run_format()
    elif args.command == "migrate":
        if args.create:
            create_migration(args.create)
        else:
            run_migrations()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()