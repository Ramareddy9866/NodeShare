# Fire Sharing Project

Fire Sharing Project combines social networking with secure file management through a unique "hop-based" sharing system. Users upload files, build friend networks, and control access depth (how many times files can be shared). The platform features interactive access graph visualization, real-time email notifications, and visual file sharing paths. Built with modern web technologies, it provides seamless cross-platform experience while maintaining robust security through JWT authentication and controlled access permissions.

## Features

- **File Upload & Management**: Upload files with customizable access depth, stored securely in the cloud (Cloudinary)
- **Friend Network**: Add friends and manage connections
- **Access Control**: Control who can access and share your files
- **Access Graph Visualization**: Visual representation of file sharing paths
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
Fire Sharing Project/
├── backend/                 # Node.js server
│   ├── config/             # Database and Cloudinary configuration
│   │   └── cloudinary.js   # Cloudinary config
│   ├── middleware/         # Authentication and upload middleware
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   └── config.js      # Configuration
│   └── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Cloudinary account (for file storage)

## Setup Instructions

### Clone Repository

```bash
git clone <repository-url>
cd Fire-Sharing-Project
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password
CLIENT_ORIGIN=http://localhost:3000
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `config.js` file in `src` directory:
```javascript
export const API_BASE_URL = 'http://localhost:5000';
```

4. Start the development server:
```bash
npm start
```

## Usage

1. **Register/Login**: Create an account or login to access the platform
2. **Add Friends**: Search and send friend requests to other users
3. **Upload Files**: Upload files and set access depth (number of sharing hops). Files are stored securely in Cloudinary.
4. **Share Files**: Share files with friends in your network
5. **View Access Graph**: Visualize how files are shared through your network
6. **Manage Access**: Revoke access or delete files as needed

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **JWT**: Authentication
- **Nodemailer**: Email notifications
- **Cloudinary**: Cloud file storage
- **multer-storage-cloudinary**: File upload middleware for Cloudinary

### Frontend
- **React**: UI framework
- **Material-UI**: Component library
- **React Router**: Navigation
- **Axios**: HTTP client
- **Vis.js**: Network visualization 

## Cloudinary Integration
- All uploaded files are stored in your Cloudinary account for scalability, reliability, and global access.
- You must set your Cloudinary credentials in the backend `.env` file.
- No files are stored locally on the server. 