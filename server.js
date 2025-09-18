const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Security middleware - prevent direct access to uploads
app.use('/uploads', (req, res) => {
    res.status(403).json({
        success: false,
        message: 'Direct access to uploads folder is forbidden. Use /files/{filename} endpoint instead.'
    });
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

app.use(express.static('public'));
app.use('/icons', express.static('icons'));

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || '/mnt/volume_sgp1_01/mabox_uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// In-memory storage for file metadata
const fileMetadata = new Map();

// Allowed file types and their MIME types
const allowedFileTypes = {
    // PDF
    'application/pdf': ['.pdf'],
    
    // Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg'],
    'image/bmp': ['.bmp'],
    'image/tiff': ['.tiff', '.tif'],
    
    // Documents
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv'],
    'application/csv': ['.csv'],
    'text/plain': ['.txt'],
    
    // Archives
    'application/zip': ['.zip'],
    'application/x-zip-compressed': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
    'application/vnd.rar': ['.rar']
};

// Get all allowed extensions
const allowedExtensions = Object.values(allowedFileTypes).flat();

// File filter function
const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    
    // Check if file extension is allowed
    if (allowedExtensions.includes(extension)) {
        // Double check with MIME type if available
        if (allowedFileTypes[mimeType] && allowedFileTypes[mimeType].includes(extension)) {
            cb(null, true);
        } else if (mimeType === 'application/octet-stream') {
            // Some files might have generic MIME type, allow based on extension
            cb(null, true);
        } else {
            cb(null, true); // Allow based on extension match
        }
    } else {
        const error = new Error('File type not allowed. Only PDF, images (JPG, PNG, GIF, WebP, SVG, BMP, TIFF), DOCX, XLSX, CSV, ZIP, and RAR files are permitted.');
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false);
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, uploadsDir);
  },
    filename: (req, file, cb) => {
        // Temporary filename, we'll rename it later if needed
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const extension = path.extname(file.originalname);
        const tempFilename = `temp_${uniqueId}${extension}`;
        cb(null, tempFilename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 1024 // 1GB limit
    }
});

// Helper function to generate expiration timestamp
function getExpirationTime(ttl) {
    const now = Date.now();
    switch (ttl) {
        case '10s':
            return now + (10 * 1000); // 10 seconds for testing
        case '30s':
            return now + (30 * 1000); // 30 seconds for testing
        case '30m':
            return now + (30 * 60 * 1000); // 30 minutes
        case '1h':
            return now + (60 * 60 * 1000); // 1 hour
        case '3h':
            return now + (3 * 60 * 60 * 1000); // 3 hours
        case '6h':
            return now + (6 * 60 * 60 * 1000); // 6 hours
        case '24h':
            return now + (24 * 60 * 60 * 1000); // 24 hours
        case '7d':
            return now + (7 * 24 * 60 * 60 * 1000); // 7 days
        default:
            return now + (60 * 60 * 1000); // Default to 1 hour
    }
}

// Helper function to clean expired files
function cleanExpiredFiles() {
    const now = Date.now();
    const expiredFiles = [];

    for (const [filename, metadata] of fileMetadata.entries()) {
        if (metadata.expiresAt < now) {
            expiredFiles.push(filename);
        }
    }

    expiredFiles.forEach(filename => {
        const filePath = path.join(uploadsDir, filename);
        
        // Delete file from disk
        fs.unlink(filePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error(`Error deleting file ${filename}:`, err);
            } else {
                console.log(`Deleted expired file: ${filename}`);
            }
        });

        // Remove from metadata
        fileMetadata.delete(filename);
    });

    if (expiredFiles.length > 0) {
        console.log(`Cleaned up ${expiredFiles.length} expired files`);
    }
}

// Run cleanup every 10 seconds for testing (change back to 10 * 60 * 1000 for production)
setInterval(cleanExpiredFiles, 10 * 1000);

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }

        const { ttl, fileName } = req.body;
        
        // Determine final filename
        let finalFilename;
        if (fileName) {
            // Use custom filename with original extension if no extension provided
            const originalExt = path.extname(req.file.originalname);
            const customExt = path.extname(fileName);
            finalFilename = customExt ? fileName : `${fileName}${originalExt}`;
        } else {
            // Use original filename
            finalFilename = req.file.originalname;
        }

        // Check if final filename already exists and add counter if needed
        let counter = 1;
        let uniqueFilename = finalFilename;
        const nameWithoutExt = path.parse(finalFilename).name;
        const extension = path.parse(finalFilename).ext;
        
        while (fs.existsSync(path.join(uploadsDir, uniqueFilename)) || fileMetadata.has(uniqueFilename)) {
            uniqueFilename = `${nameWithoutExt}(${counter})${extension}`;
            counter++;
        }

        // Rename the temporary file to final filename
        const tempPath = req.file.path;
        const finalPath = path.join(uploadsDir, uniqueFilename);
        fs.renameSync(tempPath, finalPath);

        const expiresAt = getExpirationTime(ttl);

        // Store metadata
        fileMetadata.set(uniqueFilename, {
            originalName: req.file.originalname,
            size: req.file.size,
            uploadedAt: Date.now(),
            expiresAt: expiresAt,
            mimetype: req.file.mimetype
        });

        // Generate shareable link
        const downloadLink = `https://mabox.tech/files/${uniqueFilename}`;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                fileName: uniqueFilename,
                originalName: req.file.originalname,
                fileSize: req.file.size,
                downloadUrl: downloadLink,
                expiresAt: new Date(expiresAt).toISOString(),
                ttl: ttl
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Download endpoint
app.get('/files/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const metadata = fileMetadata.get(filename);

        // Check if file metadata exists
        if (!metadata) {
            return res.status(404).json({ 
                success: false, 
                message: 'File not found' 
            });
        }

        // Check if file has expired
        if (metadata.expiresAt < Date.now()) {
            // Clean up expired file
            const filePath = path.join(uploadsDir, filename);
            fs.unlink(filePath, () => {});
            fileMetadata.delete(filename);

            return res.status(410).json({ 
                success: false, 
                message: 'File has expired' 
            });
        }

        // Check if physical file exists
        const filePath = path.join(uploadsDir, filename);
        if (!fs.existsSync(filePath)) {
            fileMetadata.delete(filename);
            return res.status(404).json({ 
                success: false, 
                message: 'File not found' 
            });
        }

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
        res.setHeader('Content-Type', metadata.mimetype);
        res.setHeader('Content-Length', metadata.size);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get file info endpoint (optional)
app.get('/info/:filename', (req, res) => {
    const filename = req.params.filename;
    const metadata = fileMetadata.get(filename);

    if (!metadata) {
        return res.status(404).json({ 
            success: false, 
            message: 'File not found' 
        });
    }

    if (metadata.expiresAt < Date.now()) {
        return res.status(410).json({ 
            success: false, 
            message: 'File has expired' 
        });
    }

    res.json({
        success: true,
        data: {
            originalName: metadata.originalName,
            size: metadata.size,
            uploadedAt: new Date(metadata.uploadedAt).toISOString(),
            expiresAt: new Date(metadata.expiresAt).toISOString(),
            mimetype: metadata.mimetype
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        uptime: process.uptime(),
        activeFiles: fileMetadata.size
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 1GB.'
            });
        }
    }
    
    if (error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mobox Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`🔄 Cleanup runs every 10 minutes`);
    
    // Run initial cleanup
    cleanExpiredFiles();
});

module.exports = app;
