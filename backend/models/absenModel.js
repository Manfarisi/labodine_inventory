import mongoose from "mongoose";

const absenSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // ✅ Tambahkan field name
    tanggal: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Hadir", "Izin", "Sakit", "Alpa"],
      required: true,
    },
    keterangan: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const absenModel =
  mongoose.models.absen || mongoose.model("absen", absenSchema);
export default absenModel;
