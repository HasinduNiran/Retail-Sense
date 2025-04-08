import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/users"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (JPEG, PNG, GIF) are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("image");

// Create a new User (unchanged from previous update)
export const createUser = async (req, res) => {
  try {
    const { UserName, email, password, address, mobile, role } = req.body;
    const image = req.file ? req.file.path : null;

    if (!UserName || !email || !password || !mobile) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const userRole = role === "admin" ? "admin" : "customer";

    const newUser = new User({
      UserName,
      email,
      password: hashedPassword,
      address: address || undefined,
      mobile: Number(mobile),
      role: userRole,
      image,
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser, // Return the full user object, including image path
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (unchanged)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single user by ID (unchanged)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { UserName, email, address, mobile, role, image } = req.body;

    if (!UserName) {
      return res.status(400).json({ success: false, message: "UserName is required" });
    }

    const mobilePattern = /^[0-9]{10}$/;
    if (!mobile || !mobilePattern.test(mobile)) {
      return res.status(400).json({ success: false, message: "Mobile number must be exactly 10 digits" });
    }

    const userRole = role === "manager" ? "manager" : "customer";

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { UserName, email, address, mobile, role: userRole, image }, // Accept image as URL
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: updatedUser, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a user (unchanged, but could add image deletion)
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Optional: Delete image file if exists
    if (deletedUser.image) {
      const imagePath = path.join(__dirname, "../../", deletedUser.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};