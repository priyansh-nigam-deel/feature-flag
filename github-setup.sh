#!/bin/bash

# GitHub Pages Setup Script for Feature Flag Control Centre
# This script helps you set up and deploy to GitHub Pages

echo "🚩 Feature Flag Control Centre - GitHub Pages Setup"
echo "=================================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Check if already a git repository
if [ -d .git ]; then
    echo "⚠️  This directory is already a git repository."
    echo "   Current remote:"
    git remote -v
    echo ""
    read -p "Do you want to continue and push to GitHub? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
else
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
    echo ""
fi

# Get GitHub repository URL
echo "Please create a new repository on GitHub first if you haven't already:"
echo "👉 https://github.com/new"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No repository URL provided. Aborted."
    exit 1
fi

# Add remote if not exists
if git remote | grep -q "origin"; then
    echo "⚠️  Remote 'origin' already exists. Updating..."
    git remote set-url origin "$REPO_URL"
else
    echo "🔗 Adding remote repository..."
    git remote add origin "$REPO_URL"
fi

echo "✅ Remote repository configured"
echo ""

# Stage all files
echo "📝 Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit."
else
    # Commit
    echo "💾 Creating commit..."
    git commit -m "Initial commit: Feature Flag Control Centre UI"
    echo "✅ Commit created"
fi
echo ""

# Push to GitHub
echo "🚀 Pushing to GitHub..."
read -p "Push to main branch? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -M main
    git push -u origin main
    echo "✅ Pushed to GitHub!"
    echo ""
fi

# Extract username and repo name from URL
if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    REPONAME="${BASH_REMATCH[2]}"
    
    echo "=================================================="
    echo "🎉 Setup Complete!"
    echo "=================================================="
    echo ""
    echo "Next Steps:"
    echo "1. Go to your GitHub repository:"
    echo "   👉 https://github.com/$USERNAME/$REPONAME"
    echo ""
    echo "2. Click on 'Settings' tab"
    echo ""
    echo "3. Scroll to 'Pages' in the left sidebar"
    echo ""
    echo "4. Under 'Source':"
    echo "   - Select 'Deploy from a branch'"
    echo "   - Branch: main"
    echo "   - Folder: / (root)"
    echo "   - Click 'Save'"
    echo ""
    echo "5. Wait a few minutes, then visit:"
    echo "   👉 https://$USERNAME.github.io/$REPONAME/"
    echo ""
    echo "=================================================="
else
    echo "✅ Files pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to your repository on GitHub"
    echo "2. Navigate to Settings > Pages"
    echo "3. Enable GitHub Pages from the main branch"
fi

