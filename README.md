# 🚩 Feature Flag Control Centre

A modern, LaunchDarkly-inspired feature flag management UI built with vanilla HTML, CSS, and JavaScript. This is a fully functional mock UI that uses localStorage for data persistence.

![Feature Flag UI](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌟 Features

### Core Functionality
- **Dashboard**: Overview of all feature flags with status, metrics, and filtering
- **Create Flags**: Rich form to create new feature flags with multiple configurations
- **Flag Details**: Comprehensive view and edit capabilities for existing flags
- **Environment Management**: Support for multiple environments (dev, stage, prod) with environment-specific configurations

### Advanced Features
- **Pattern-Based Environments**: Create wildcard patterns like `giger-*` to configure multiple environments at once
- **Default Environment Fallback**: Automatic fallback to default configuration when specific environment config doesn't exist
- **Targeting Rules**: Complex rule-based targeting with conditions and operators
- **Percentage Rollout**: Gradual rollout with percentage distribution across variations
- **Multiple Value Types**: Boolean, String, Number, and Object (JSON) flag types
- **Flag Categories**: Custom flags with expiry dates and kill switches
- **Audit Log**: Track all changes with timestamps and user information
- **Metrics & Analytics**: Evaluation metrics, variation distribution, and trends
- **Version Control**: Rollback to previous versions with history tracking

### UI/UX
- **Modern Design**: LaunchDarkly-inspired clean and professional interface
- **Responsive**: Works on desktop and mobile devices
- **Dark/Light Themes**: Environment overlays support both themes
- **Toast Notifications**: User-friendly feedback messages
- **CSV Input Support**: Bulk input for targeting conditions
- **Drag & Drop**: Intuitive reordering of targeting rules

## 🚀 Quick Start

### View Online
Visit the live demo: [Your GitHub Pages URL]

### Run Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. Open `index.html` in your browser:
   ```bash
   open index.html
   # or
   python -m http.server 8000
   # then visit http://localhost:8000
   ```

That's it! No build process or dependencies required.

## 📁 Project Structure

```
.
├── index.html              # Entry point (redirects to static/index.html)
├── static/
│   ├── index.html         # Dashboard page
│   ├── create-flag.html   # Create new flag page
│   ├── flag-detail.html   # Flag details page
│   ├── environments.html  # Environments management
│   ├── debug.html         # Debug/Simulate page
│   ├── styles.css         # All styles
│   ├── script.js          # Create flag logic
│   ├── flag-detail.js     # Flag detail logic
│   ├── dashboard.js       # Dashboard logic
│   ├── environments.js    # Environment management
│   └── debug.js           # Debug/simulation logic
├── deployment/            # Kubernetes deployment files (optional)
├── deploy.sh              # Kubernetes deployment script (optional)
└── README.md              # This file
```

## 🎯 Usage Guide

### Creating a Feature Flag

1. Click **"Create New Flag"** from the dashboard
2. Fill in basic information:
   - **Flag Name**: Unique identifier (e.g., `enable_new_dashboard`)
   - **Description**: What this flag controls
   - **Owner**: Person responsible for the flag
   - **Team**: Owning team
   - **Flag Category**: Custom Flag or Kill Switch
   - **Expiry Date**: Cleanup date (optional for kill switches)

3. Configure environments:
   - Select **"Default"** to set base configuration
   - Add specific environments or patterns
   - Configure targeting rules per environment

4. Define variations:
   - Choose value type (Boolean, String, Number, Object)
   - Variations are generated automatically based on type
   - Customize variation values as needed

### Environment Configuration Hierarchy

The system uses a three-tier configuration hierarchy:

1. **Exact Match**: Specific environment configuration (e.g., `prod`)
2. **Pattern Match**: Wildcard pattern (e.g., `giger-*` matches `giger-1`, `giger-2`)
3. **Default Fallback**: Default environment configuration

Example:
- `prod` → Uses prod-specific config (if exists)
- `giger-5` → Uses `giger-*` pattern config (if exists)
- `new-env` → Falls back to default config

### Adding Pattern-Based Environments

1. Click the **"+"** tile in Environment & Targeting
2. Select **"Pattern-based Configuration"**
3. Enter pattern (e.g., `giger-*`, `feature-*`, `test-*`)
4. Configure targeting rules for all matching environments

### Targeting Rules

Create sophisticated targeting with:
- **Conditions**: Context-based matching (organization_id, user_id, email, etc.)
- **Operators**: is, is not, is one of, contains, starts with, ends with
- **CSV Values**: Comma-separated lists for bulk targeting
- **Serve Options**:
  - Single variation
  - Percentage rollout with distribution

## 🔧 Configuration

All data is stored in browser localStorage:
- `featureFlags`: Array of all feature flags
- Per-session environment configurations (not persisted)

## 🌐 Deploy to GitHub Pages

### Option 1: Using GitHub Web Interface

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to **Settings** > **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**
7. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Option 2: Using Git Command Line

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Feature Flag Control Centre"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main

# Enable GitHub Pages via Settings > Pages in GitHub web interface
```

## 🎨 Customization

### Styling
Edit `static/styles.css` to customize colors, fonts, and layout.

### Adding Environments
Default environments are: Default, Dev, Stage, Prod. Add more in:
- `static/create-flag.html` (environment tiles)
- `static/flag-detail.html` (environment tiles)

### Flag Types
Currently supports: Boolean, String, Number, Object. Add more in `handleFlagTypeChange()` functions.

## 🐛 Known Limitations

- **Data Persistence**: Uses localStorage (browser-specific, not synced)
- **No Backend**: This is a UI-only implementation
- **No Authentication**: No user management system
- **No Real Evaluation**: Flag evaluation is simulated

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Inspired by [LaunchDarkly](https://launchdarkly.com/)
- Built with ❤️ using vanilla JavaScript

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Note**: This is a mock UI for demonstration and development purposes. For production feature flag management, consider using services like LaunchDarkly, Split.io, or building a proper backend system.
