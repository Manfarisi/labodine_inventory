import mongoose from "mongoose";

const ProdukKeluarSchema = new mongoose.Schema({
  namaProduk: { type: String, required: true },
  keterangan: { type: String, required: true },
  jenisPengeluaran: {
    type: String,
    required: true,
    enum: ['Penjualan', 'Rusak', 'Lainya'], 
  },
  harga: { type: Number, required: true },
  jumlah: { type: Number, required: true },
  total: { type: Number }, // Tidak perlu required, karena akan diisi otomatis
  tanggal: { type: Date, required: true },
});

// Middleware untuk menghitung total sebelum disimpan
ProdukKeluarSchema.pre('save', function(next) {
  this.total = this.harga * this.jumlah;
  next();
});

const ProdukKeluarModel =
  mongoose.models.ProdukKeluar || mongoose.model("ProdukKeluar", ProdukKeluarSchema);
export default ProdukKeluarModel;
