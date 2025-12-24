# Google OAuth Setup Instructions

## Steps to Configure Google Login

### 1. Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **OAuth 2.0 Client ID**
6. Configure the OAuth consent screen if prompted
7. Choose **Web application** as the application type
8. Add authorized JavaScript origins:
   - `https://localhost:5173` (for development)
   - Your production URL
9. Add authorized redirect URIs:
   - `https://localhost:5173` (for development)
   - Your production URL
10. Copy the **Client ID**

### 2. Configure Frontend

1. Open the `.env` file in the frontend root directory
2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

### 3. Configure Backend

1. Open `appsettings.json` in your backend project
2. Add the Google Client ID configuration:
   ```json
   {
     "GoogleAuth": {
       "ClientId": "your-actual-client-id.apps.googleusercontent.com"
     }
   }
   ```

### 4. Restart Development Server

After updating the `.env` file, restart your Vite development server:

```bash
npm run dev
```

## Login Rules (Based on Backend Logic)

### For @fpt.edu.vn emails (K18):

- Automatically creates new user if not exists
- Default role: Student (RoleId = 3)
- No pre-registration required

### For @gmail.com emails (K19):

- Must be pre-registered in the database
- Will be rejected if email not found
- Contact admin to register your email first

### Other email domains:

- Not allowed for login

## Testing

1. Navigate to login page: `https://localhost:5173/login`
2. Click the "Continue with Google" button
3. Select your Google account
4. Verify successful login and token storage

## Troubleshooting

**"Google login failed"**:

- Check if Client ID is correctly set in `.env`
- Verify authorized origins in Google Cloud Console
- Check browser console for detailed error messages

**"Email not authorized" (for @gmail.com)**:

- Ensure your email is registered in the database
- Contact system administrator

**Token validation fails**:

- Verify backend `GoogleAuth:ClientId` matches frontend
- Check that Google+ API is enabled in Google Cloud Console
