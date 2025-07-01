import mongoose from "mongoose";

const BahanBakuKeluarSchema = new mongoose.Schema(
  {
    namaBarang: {
      type: String,
      required: true,
    },
    jumlah: {
      type: Number,
      required: true,
      min: 1,
    },
    satuan: {
      type: String,
      required: true,
      enum: [
        "kg",
        "gram",
        "ons",
        "liter",
        "ml",
        "meter",
        "cm",
        "mm",
        "pack",
        "lusin",
        "kodi",
        "rim",
        "box",
        "unit",
        "pcs",
        "set",
        "roll",
        "tablet",
        "botol",
        "tube",
        "kaleng",
        "bungkus",
        "tray",
        "cup",
      ],
    },
    jenisPengeluaran: {
      type: String,
      required: true,
      enum: ["Produksi", "Rusak", "Lainya"], // bisa kamu ubah sesuai kasus
    },
    keterangan: {
      type: String,
      default: "",
    },
    tanggal: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // menambahkan createdAt dan updatedAt otomatis
  }
);

const BahanBakuKeluarModel =
  mongoose.models.bahanBakuKeluar ||
  mongoose.model("BahanBakuKeluar", BahanBakuKeluarSchema);
export default BahanBakuKeluarModel;
