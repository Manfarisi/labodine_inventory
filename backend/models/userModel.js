import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kategori: { type: String, required: true, enum: ["Admin", "Pegawai", "Supervisor", "Kasir"] },

    // Informasi tambahan
    namaLengkap: { type: String, required: true },
    jenisKelamin: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
    noTelepon: { type: String },
    alamat: { type: String },

    // Status dan audit
    status: { type: String, enum: ["Aktif", "Nonaktif"], default: "Aktif" },
    foto: { type: String }, // URL atau path foto profil
    lastLogin: { type: Date }, // waktu terakhir login
  },
  {
    timestamps: true, // createdAt & updatedAt
    minimize: false,
  }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
