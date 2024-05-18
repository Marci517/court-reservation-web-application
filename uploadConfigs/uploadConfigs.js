import multer from 'multer';
import path from 'path';

export const uploadDir = path.join(process.cwd(), 'uploadDir');
export const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});
