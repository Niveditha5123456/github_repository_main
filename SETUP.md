# GitHub Analyzer - Setup Instructions

## Backend Server Setup

The application now requires a Node.js backend server to handle API calls properly and avoid CORS issues.

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Running

1. **Navigate to the project directory:**
   ```bash
   cd "c:\Users\asus\Downloads\github analyzer"
   ```

2. **Install dependencies:**
   ```bash
   npm install express cors node-fetch
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

   You should see:
   ```
   GitHub Analyzer server running at http://localhost:3000
   Open http://localhost:3000/dashboard.html in your browser
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:3000/dashboard.html`
   - The server will serve all HTML/CSS/JS files

### How It Works

- The browser frontend calls the backend API at `http://localhost:3000/api/analyze`
- The backend proxies the request to OpenRouter API
- This bypasses CORS restrictions and provides better error handling
- The analysis results are returned to the frontend for display

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/analyze` - Send repository analysis prompt
  - Body: `{ "prompt": "analysis prompt text" }`
  - Returns: `{ "success": true, "analysis": "analysis text" }`

### Troubleshooting

If you get "API request failed" errors:

1. **Check server is running:**
   - Make sure `node server.js` is still running
   - Look for "server running at http://localhost:3000" message

2. **Check backend console:**
   - The backend logs API responses and errors
   - Look for "API Error Response" messages

3. **Check browser console:**
   - Open DevTools (F12) → Console
   - Look for network errors or JSON parsing errors

4. **Verify API key:**
   - Check `config.js` has a valid OpenRouter API key
   - API key format: `sk-or-v1-...`

### Development

For development with auto-reload:
```bash
npm install -D nodemon
npx nodemon server.js
```

Server will restart automatically when files change.
