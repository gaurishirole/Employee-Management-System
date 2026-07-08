import multer from "multer";
import imagekit from "../config/imagekit.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed"));
    }
  },
});

export const uploadSingleFile = upload.single("file");
export const uploadArray = upload.array("files", 5);

export const uploadToImageKit = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}_${req.file.originalname}`,
      folder: "/employee-documents",
    });

    req.imageUrl = result.url;
    next();
  } catch (error) {
    console.error("ImageKit upload error:", error);
    res.status(500).json({ message: "File upload failed" });
  }
};

export const uploadMultiple = upload.fields([
  { name: "passportPhoto", maxCount: 1 },
  { name: "tenthMarksheet", maxCount: 1 },
  { name: "twelthDiplomaMarksheet", maxCount: 1 },
  { name: "graduationMarksheet", maxCount: 1 },
  { name: "bankPassbookPhoto", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "cv", maxCount: 1 },
]);

export const handleMultipleUploads = (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const uploads = {};
    const fields = [
      "passportPhoto",
      "tenthMarksheet",
      "twelthDiplomaMarksheet",
      "graduationMarksheet",
      "bankPassbookPhoto",
      "aadharFront",
      "aadharBack",
      "panCard",
      "cv",
    ];

    if (!req.files) {
      req.uploadedUrls = uploads;
      return next();
    }

    for (const field of fields) {
      if (req.files[field] && req.files[field][0]) {
        try {
          const result = await imagekit.upload({
            file: req.files[field][0].buffer,
            fileName: `${Date.now()}_${req.files[field][0].originalname}`,
            folder: "/employee-documents",
          });
          uploads[field] = result.url;
        } catch (error) {
          console.error(`Upload error for ${field}:`, error);
          return res.status(500).json({ message: `Upload failed for ${field}` });
        }
      }
    }

    req.uploadedUrls = uploads;
    next();
  });
};
