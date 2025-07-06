import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_USERNAME = "Admin";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Approve user
const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.status = "approved";
    await user.save();

    res.json({ success: true, message: "User approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to approve user" });
  }
};


// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      let admin = await userModel.findOne({ email });

      if (!admin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await userModel.create({
          username: ADMIN_USERNAME,
          email: ADMIN_EMAIL,
          password: hashedPassword,
          kategori: "Admin",
        });
      }

      const token = createToken(admin._id);
      console.log(token);
      return res.json({
        success: true,
        message: "Admin logged in successfully",
        token,
        user: {
          username: admin.username,
          email: admin.email,
          kategori: admin.kategori,
        },
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    if (user.status !== "approved") {
      return res.json({
        success: false,
        message: "Akun Anda belum disetujui oleh admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        username: user.username,
        email: user.email,
        kategori: user.kategori,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// Register user (pegawai only)
const registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    namaLengkap,
    jenisKelamin,
    noTelepon,
    alamat,
  } = req.body;

  try {
    if (email === ADMIN_EMAIL) {
      return res.json({
        success: false,
        message: "You cannot register as admin",
      });
    }

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      kategori: "Pegawai",
      namaLengkap,
      jenisKelamin,
      noTelepon,
      alamat,
      status: "pending", // ⬅️ Tambahkan ini
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// controller userController.js
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, "-password -__v");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal ambil user", error: err });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findById(id).select("-password"); // Hilangkan field password
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user", error });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.kategori === "Admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot update Admin user" });
    }

    // Validasi email
    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;

    if (password) {
      if (password.length < 6) {
        return res.json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user", error });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.kategori === "Admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete Admin user" });
    }

    await userModel.findByIdAndDelete(id);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete user", error });
  }
};

export {
  loginUser,
  registerUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  approveUser
};
