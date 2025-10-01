const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// setup storage in cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fire-sharing-project',  
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mp3', 'zip', 'rar'], 
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }], 
  },
});

// configure multer upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // max 100 MB
  },
  fileFilter: (req, file, cb) => {
    cb(null, true); // accept all files
  }
});

module.exports = upload;
