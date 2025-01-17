const multer = require('multer');
const path = require('path');

// دالة لتحديد مجلد الوجهة بناءً على نوع الملف
const getDestination = (req, file, cb) => {
  let folder = 'uploads/'; // المجلد الافتراضي
  if (req.baseUrl.includes('material')) {
    folder = 'uploads/materials/'; // مجلد Materials
  } else if (req.baseUrl.includes('activity')) {
    folder = 'uploads/activities/'; // مجلد Activities
  }
  cb(null, folder);
};

// إعدادات Multer
const storage = multer.diskStorage({
  destination: getDestination, // استخدام الدالة لتحديد المجلد
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // إضافة اسم فريد للملف
  }
});

// التحقق من نوع الملف
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', // PDF
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
    'image/jpeg', // JPEG
    'image/png' // PNG
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // قبول الملف
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف PDF، Word، Excel، JPEG، أو PNG.'), false); // رفض الملف
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // تحديد الحجم الأقصى للملف (10 ميجابايت)
});

module.exports = {
  uploadSingleFile: upload.single('file') // سيتم رفع ملف واحد باسم "file"
};