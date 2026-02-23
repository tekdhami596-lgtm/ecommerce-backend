import Banner from "../models/Banner";
import cloudinary from "../config/cloudinary";

const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "ecommerce/banners" }, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      })
      .end(file.buffer);
  });
};

const deleteFromCloudinary = async (imageUrl: string) => {
  try {
    const parts = imageUrl.split("/");
    const filename = parts.at(-1)?.split(".")[0];
    const folder = parts.at(-2);
    if (!filename || !folder) return;
    await cloudinary.uploader.destroy(`${folder}/${filename}`);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
};

const bannerService = {
  getAll: async () => {
    return await Banner.findAll({ order: [["order", "ASC"]] });
  },

  create: async (file: Express.Multer.File, body: any) => {
    try {
      const imageUrl = await uploadToCloudinary(file);
      console.log("Cloudinary URL:", imageUrl); // ← check if upload works

      const banner = await Banner.create({
        title: body.title,
        subtitle: body.subtitle,
        ctaText: body.ctaText,
        ctaLink: body.ctaLink,
        imagePath: imageUrl,
        order: body.order ?? 0,
      });

      console.log("Banner created:", banner); // ← check if DB insert works
      return banner;
    } catch (err) {
      console.error("BANNER CREATE ERROR:", err); // ← this will show exact error
      throw err;
    }
  },

  delete: async (id: string) => {
    const banner = await Banner.findByPk(id);
    if (!banner) throw new Error("Banner not found");
    await deleteFromCloudinary((banner as any).imagePath);
    await banner.destroy();
  },
};

export default bannerService;
