import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  namaProduk: { type: String, required: true },
  jumlah: { type: Number, required: true },
  hargaSatuan: { type: Number, required: true },
  total: { type: Number, required: true }
});

const pemasukanSchema = new mongoose.Schema({
  items: {
    type: [itemSchema],
    required: true,
  },
  totalPemasukan: { type: Number, required: true },
  keterangan: { type: String },
  tanggal: { type: Date, required: true }
});

const pemasukanModel =
  mongoose.models.pemasukan || mongoose.model("pemasukan", pemasukanSchema);

export default pemasukanModel;
