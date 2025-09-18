# Mobox - Secure Temporary File Storage

A modern, secure web application for temporary file storage with automatic expiration, complete privacy, and no data collection. Built with Node.js, Express.js, and a clean, responsive frontend inspired by catbox.moe.

## 🔒 **100% Privacy & Security Guaranteed**

- **Zero Access**: Files cannot be accessed by anyone, including the author
- **No Monitoring**: No file content scanning or surveillance  
- **Auto-Delete**: Automatic cleanup after expiration with no manual intervention
- **No Tracking**: Zero user tracking, logging, or data collection
- **Secure Storage**: Files protected with server-side access controls and .htaccess rules

## ✨ Features

- **Drag & Drop Upload**: Modern, intuitive file upload interface
- **Extended TTL Options**: 30 minutes, 1 hour, 3 hours, 6 hours, 24 hours, or 7 days
- **Original Filenames**: Files keep their original names with automatic conflict resolution
- **Custom Naming**: Optional custom filename parameter for API users
- **Large File Support**: Up to 1GB file size limit
- **File Type Restrictions**: PDF, images, documents (DOCX, XLSX, CSV), and archives (ZIP, RAR)
- **Shareable Links**: Direct download links using https://mabox.tech domain
- **Complete API Documentation**: Comprehensive REST API with examples in multiple languages
- **Donation Integration**: Support the service via Saweria platform
- **Responsive Design**: Modern, flat design that works perfectly on all devices
- **Security Headers**: Full security implementation with XSS protection and content type validation

## Technology Stack

- **Backend**: Node.js with Express.js
- **File Handling**: Multer for multipart/form-data uploads
- **Frontend**: Vanilla JavaScript with Fetch API
- **Storage**: Local filesystem with in-memory metadata
- **UI**: Modern CSS with Inter font and Font Awesome icons

## Project Structure

```
temp-file-storage/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .gitignore             # Git ignore rules
├── public/                # Frontend files
│   ├── index.html         # Main HTML page
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── uploads/               # File storage directory
│   └── .gitkeep          # Keep directory in git
└── .github/
    └── copilot-instructions.md
```

## Installation & Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd temp-file-storage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The application should load with the TempStore interface

### Development Mode

For development with auto-restart on file changes:

```bash
npm run dev
```

## Usage

### Uploading Files

1. **Select a file** - Drag & drop onto the upload zone or click "Browse Files"
2. **Choose TTL** - Select how long the file should be available:
   - 1 Hour
   - 24 Hours (default)
   - 7 Days
3. **Upload** - Click "Upload File" and wait for completion
4. **Share** - Copy the generated link and share it

### Download Links

Generated links follow this format:
```
https://mabox.tech/files/{unique-filename}
```

**Important**: Links automatically expire and become invalid after the selected time period.

## API Endpoints

### Upload File
```http
POST /upload
Content-Type: multipart/form-data

Body:
- file: File to upload
- ttl: Expiration time (1h, 24h, 7d)

Response:
{
  "success": true,
  "data": {
    "filename": "abc123def456.pdf",
    "originalName": "document.pdf",
    "size": 1048576,
    "downloadLink": "https://mabox.tech/files/abc123def456.pdf",
    "expiresAt": "2025-09-18T10:30:00.000Z",
    "ttl": "24h"
  }
}
```

### Download File
```http
GET /files/{filename}

Response:
- File stream with appropriate headers
- 404 if file not found
- 410 if file expired
```

### File Info
```http
GET /info/{filename}

Response:
{
  "success": true,
  "data": {
    "originalName": "document.pdf",
    "size": 1048576,
    "uploadedAt": "2025-09-17T10:30:00.000Z",
    "expiresAt": "2025-09-18T10:30:00.000Z",
    "mimetype": "application/pdf"
  }
}
```

### Health Check
```http
GET /health

Response:
{
  "success": true,
  "message": "Server is running",
  "uptime": 3600,
  "activeFiles": 42
}
```

## Configuration

### Environment Variables

You can set these environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### File Limits

- **Maximum file size**: 1GB
- **Supported file types**: 
  - **Documents**: PDF, DOCX, XLSX, CSV
  - **Images**: JPG, JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
  - **Archives**: ZIP, RAR
- **Cleanup interval**: Every 10 minutes

### TTL Options

- `1h` - 1 hour
- `24h` - 24 hours  
- `7d` - 7 days

## Security Features

- **Unique filenames**: Generated using crypto.randomBytes to prevent conflicts
- **File validation**: Size limits and proper error handling
- **Automatic cleanup**: Expired files are automatically removed
- **No database**: In-memory metadata reduces attack surface
- **Input sanitization**: Proper validation on all endpoints

## Development

### Adding New Features

1. **Server logic** - Modify `server.js`
2. **Frontend logic** - Update `public/script.js`
3. **Styling** - Edit `public/styles.css`
4. **Structure** - Modify `public/index.html`

### Running Tests

Currently no automated tests. To test manually:

1. Start the server: `npm start`
2. Upload various file types and sizes
3. Test TTL expiration
4. Verify cleanup process
5. Test error scenarios

### Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up nginx reverse proxy
4. Configure SSL certificates
5. Set up monitoring and logging

## Browser Support

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Required features**: Fetch API, File API, Drag & Drop API
- **Optional features**: Clipboard API for copy functionality

## Troubleshooting

### Common Issues

**Server won't start**
- Check if port 3000 is available
- Verify Node.js installation: `node --version`
- Ensure dependencies are installed: `npm install`

**File upload fails**
- Check file size (max 100MB)
- Verify server is running
- Check browser console for errors

**Files not cleaning up**
- Cleanup runs every 10 minutes automatically
- Check server logs for errors
- Verify upload directory permissions

**Links not working**
- Ensure file hasn't expired
- Check filename in URL is correct
- Verify server is accessible

### Logs

Server logs include:
- Upload events
- Download requests
- Cleanup operations
- Error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues or questions:
- Check the troubleshooting section
- Review server logs
- Create an issue in the repository

---

**Built with ❤️ using Node.js and modern web technologies**