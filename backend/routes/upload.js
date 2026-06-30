// ── /api/upload ───────────────────────────────────────────────────────────────
// File uploads: images and videos → Cloudinary
const router     = require("express").Router();
const cloudinary = require("cloudinary").v2;
const multer     = require("multer");
const { protect } = require("../middleware/auth");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store in memory first, then stream to Cloudinary
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/quicktime","video/webm"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/upload/image — upload a photo
router.post("/image", protect, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "agroconnect/images", resource_type: "image", quality: "auto", fetch_format: "auto" },
        (err, result) => err ? reject(err) : resolve(result)
      ).end(req.file.buffer);
    });
    res.json({ url: result.secure_url, public_id: result.public_id, type: "image" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/upload/video — upload a video
router.post("/video", protect, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "agroconnect/videos", resource_type: "video" },
        (err, result) => err ? reject(err) : resolve(result)
      ).end(req.file.buffer);
    });
    res.json({ url: result.secure_url, public_id: result.public_id, type: "video" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/upload/:publicId — remove a file from Cloudinary (admin or owner)
router.delete("/:publicId", protect, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: "File deleted." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
