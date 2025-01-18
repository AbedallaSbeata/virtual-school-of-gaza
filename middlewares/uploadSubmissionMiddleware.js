// uploadFileMiddleware.js
const multer = require('multer');
const path = require('path');

// تحديد مكان حفظ الملفات
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/submissions/'); // سيتم حفظ الملفات في مجلد uploads/submissions
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // إضافة اسم فريد للملف
  }
});

// التحقق من نوع الملف
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // قبول الملف
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف PDF، Word، أو Excel.'), false); // رفض الملف
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // تحديد الحجم الأقصى للملف (10 ميجابايت)
});

module.exports = {
  uploadSubmissionFile: upload.single('file') // سيتم رفع ملف واحد باسم "file"
};