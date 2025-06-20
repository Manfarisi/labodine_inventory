import mongoose from "mongoose";

const bahanBakuSchema = new mongoose.Schema({
  namaBarang: { type: String, required: true },
  keterangan: { type: String, required: true },
  satuan: { type: String, required: true },
  jumlah: { type: Number, required: true },
  jenisPemasukan: { type: String, required: true },
  tanggal: {type: Date, required: true },
  // image: {type:String,required:true},
},{ timestamps: true });

const bahanBakuModel =
  mongoose.models.bahanBaku || mongoose.model("bahanBaku", bahanBakuSchema);
export default bahanBakuModel;
