const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

console.log('🔧 Initializing Cloudinary upload middleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
const testCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully:', result);
  } catch (error) {
    console.error('❌ Cloudinary connection error:', error.message);
  }
};

testCloudinary();

// Configure Cloudinary storage for resumes
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'placeverse/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // For non-image files like PDFs
    public_id: (req, file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `resume_${timestamp}_${originalName}`;
    }
  },
});

// Create multer instance with file validation
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📄 File upload attempt:', {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    });

    // Check file type
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      console.log('✅ File type approved:', file.mimetype);
      cb(null, true);
    } else {
      console.log('❌ File type rejected:', file.mimetype);
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
});

module.exports = upload;
