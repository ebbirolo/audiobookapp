# Deployment Instructions

## GitHub Pages Deployment

This PWA can be deployed to GitHub Pages using the provided GitHub Actions workflow.

### Prerequisites

1. A GitHub repository
2. Node.js (optional, for local testing)

### Deployment Options

#### Option 1: Using GitHub Actions (Recommended)

1. Push your code to the `main` branch
2. The GitHub Actions workflow in `.github/workflows/deploy.yml` will automatically:
   - Build the site (if needed)
   - Deploy to the `gh-pages` branch
3. Go to repository Settings → Pages
4. Set source to `gh-pages` branch
5. Your site will be published at `https://username.github.io/repository-name/`

#### Option 2: Manual Deployment to `docs` folder

1. Enable GitHub Pages in repository settings
2. Set source to `docs` folder
3. Ensure all content is in the `docs` folder
4. Push to your repository

#### Option 3: Manual Deployment to `gh-pages` branch

1. Create and checkout a `gh-pages` branch
2. Copy all content to this branch
3. Push the `gh-pages` branch
4. Go to repository Settings → Pages
5. Set source to `gh-pages` branch

### Testing Locally

To test the PWA locally:

1. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve -s . -l 8000
   ```

2. Open `http://localhost:8000` in your browser
3. Test offline functionality by disconnecting from network

### iOS Specific Notes

For iOS devices:
- Ensure you have a valid SSL certificate (GitHub Pages provides this)
- The manifest.json must be properly formatted
- Service worker must be registered and working
- Add to Home Screen functionality works in Safari

### Troubleshooting

1. **Service worker not registering**: Check browser console for errors
2. **Manifest not loading**: Verify manifest.json is valid JSON
3. **Icons not showing**: Ensure icon files exist and are accessible
4. **Add to Home Screen not showing**: 
   - Must be served over HTTPS (localhost works for testing)
   - Must have a valid manifest with name, icons, and start_url
   - Must be served with a service worker registered