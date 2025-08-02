import mongoose from "mongoose";

const pengeluaranSchema = new mongoose.Schema({
  namaPengeluaran: { type: String, required: true },
  keterangan: { type: String, required: true },
  jumlah: { type: Number, required: true },
  jenisPengeluaran: {
    type: String,
    required: true,
    enum: ['Listrik', 'Air', 'Gaji','Operasional', 'Sewa','Transportasi','Konsumsi', 'Lainnya'], // bisa kamu ubah sesuai kasus
  },
  tanggal: {type: Date, required: true },
});

const pengeluaranModel =
  mongoose.models.pengeluaran || mongoose.model("pengeluaran", pengeluaranSchema);
export default pengeluaranModel;
