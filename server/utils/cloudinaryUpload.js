import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = async (fileBuffer, folder = 'afro-task/profiles', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      timeout: 120000, // 2 minutes timeout
    };

    // Add transformations only for images
    if (resourceType === 'image') {
      uploadOptions.transformation = [
        { width: 1200, height: 1200, crop: 'limit' }, // Increased size, use limit instead of fill
        { quality: 'auto:good' }
      ];
    } else if (resourceType === 'video') {
      // Video-specific options
      uploadOptions.resource_type = 'video';
      uploadOptions.chunk_size = 6000000; // 6MB chunks for large videos
      uploadOptions.eager_async = true; // Process video asynchronously,
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};
