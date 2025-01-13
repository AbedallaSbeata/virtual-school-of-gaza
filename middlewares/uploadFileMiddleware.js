const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/materials/');  
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// التحقق من نوع الملف المرفوع
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('application/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // تحديد الحجم الأقصى للملفات (5 ميجابايت)
});

module.exports = {
  uploadSingleFile: upload.single('file_url')
};
