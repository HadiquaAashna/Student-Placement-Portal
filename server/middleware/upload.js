import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isResume = file.originalname.toLowerCase().endsWith('.pdf');
      return {
        folder: 'campusconnect',
        resource_type: isResume ? 'raw' : 'image',
        allowed_formats: isResume ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
      };
    }
  });
} else {
  // Ensure local uploads directory exists
  const uploadDir = 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
  });
}

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    // Accept PDFs regardless of the exact mimetype the browser reports
    // (some report application/octet-stream or application/x-pdf).
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/x-pdf' ||
      file.mimetype === 'application/octet-stream' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF format is allowed for resumes.'), false);
    }
  } else if (file.fieldname === 'photo') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image formats are allowed for profile photos.'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload;
