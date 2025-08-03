#!/bin/bash
# UV Installation Script for Lion Rocket

echo "🚀 Installing UV for Lion Rocket..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    # Linux or macOS
    curl -LsSf https://astral.sh/uv/install.sh | sh
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo "✅ UV installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your terminal or run: source ~/.bashrc (or ~/.zshrc)"
echo "2. Run: uv --version to verify installation"
echo "3. Run: uv run install to install all dependencies"
echo "4. Run: uv run dev to start the development servers"