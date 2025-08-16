// main.js - Xử lý upload ảnh và tích hợp với Cloudinary
// Sử dụng Cloudinary CDN thay vì npm package

// Upload ảnh lên Cloudinary (không cần import)
async function uploadToCloudinary(file) {
    try {
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "PhysiPack"); // Thay bằng upload preset của bạn

      // Upload lên Cloudinary
      // Sẽ phải thay đổi phần dcadizjkf thành tên của các bạn
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/diykuppqw/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.secure_url) {
        return result.secure_url;
        console.log(result.secure_url);
      } else {
        throw new Error(
          `Upload thất bại: ${result.error?.message || "Không rõ lỗi"}`
        );
      }
    } catch (error) {
        throw error;
    }
}