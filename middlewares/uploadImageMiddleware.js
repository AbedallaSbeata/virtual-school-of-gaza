const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/users/'); 
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
    cb(null, true);
  } else {
    cb(new Error('يرجى رفع صور فقط (JPEG أو PNG).'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // تحديد الحجم الأقصى (5 ميجابايت)
});

module.exports = {
  uploadFields: upload.fields([
    { name: 'identity_image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 }
  ])
};