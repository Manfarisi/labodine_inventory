import fs from "fs";
import foodModel from "../models/foodModel.js";
import ProdukKeluarModel from "../models/produkKeluarModel.js";

// Tambah data keluar produk
const addDaftarKeluarProduk = async (req, res) => {
  try {
    const { namaProduk, jumlah, jenisPengeluaran, keterangan, tanggal } = req.body;

    const produk = await foodModel.findOne({
      namaProduk: new RegExp(`^${namaProduk.trim()}$`, "i"),
    });

    if (!produk) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    // Validasi jika stok tidak cukup
    if (jumlah > produk.jumlah) {
      return res.status(400).json({
        success: false,
        message: `Stok produk '${produk.namaProduk}' tidak mencukupi`,
      });
    }

    const harga = produk.harga;
    const total = harga * jumlah;

    // Kurangi stok produk
    produk.jumlah -= jumlah;
    await produk.save();

    // Simpan data produk keluar
    const data = new ProdukKeluarModel({
      namaProduk,
      jumlah,
      harga,
      total,
      jenisPengeluaran,
      keterangan,
      tanggal: tanggal || new Date(),
    });

    await data.save();

    res.status(201).json({
      success: true,
      message: "Data produk keluar berhasil ditambahkan dan stok dikurangi",
      data,
    });
  } catch (error) {
    console.error("Gagal menambahkan produk keluar:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};


// Daftar keluar produk
const listDaftarKeluarProduk = async (req, res) => {
  try {
    const daftarKeluar = await ProdukKeluarModel.find({}).sort({ tanggal: -1 });
    const daftar = daftarKeluar.map((keluar) => {
      const harga = Number(keluar.harga) || 0;
      const jumlah = Number(keluar.jumlah) || 0;
      const total = harga * jumlah;

      return {
        ...keluar.toObject(),
        harga,
        total,
      };
    });

    res.json({ success: true, data: daftar });
  } catch (error) {
    console.error("Gagal mengambil data produk keluar:", error.message);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

// Hapus keluar produk
const removeDaftarKeluarProduk = async (req, res) => {
  try {
    const keluarProduk = await ProdukKeluarModel.findById(req.body.id);
    if (!keluarProduk) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    // Kembalikan stok ke produk
    const produk = await foodModel.findOne({
      namaProduk: new RegExp(`^${keluarProduk.namaProduk.trim()}$`, "i"),
    });

    if (produk) {
      produk.jumlah += keluarProduk.jumlah;
      await produk.save();
    }

    // Hapus data produk keluar
    await ProdukKeluarModel.findByIdAndDelete(req.body.id);

    res.json({ success: true, message: "Data Keluar Produk berhasil dihapus dan stok dikembalikan" });
  } catch (error) {
    console.error("Gagal menghapus produk keluar:", error.message);
    res.status(500).json({ success: false, message: "Gagal menghapus data" });
  }
};


// Edit keluar produk
const editDaftarKeluarProduk = async (req, res) => {
  try {
    const { id, jumlah, jenisPengeluaran, keterangan, tanggal } = req.body;

    const keluarProduk = await ProdukKeluarModel.findById(id);
    if (!keluarProduk) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    const produk = await foodModel.findOne({
      namaProduk: new RegExp(`^${keluarProduk.namaProduk.trim()}$`, "i"),
    });

    if (!produk) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan di stok" });
    }

    const jumlahLama = keluarProduk.jumlah;
    const jumlahBaru = Number(jumlah);

    // Hitung selisih
    const selisih = jumlahBaru - jumlahLama;

    // Cek jika selisih positif (menambah jumlah keluar), pastikan stok cukup
    if (selisih > 0 && produk.jumlah < selisih) {
      return res.status(400).json({ success: false, message: "Stok tidak mencukupi untuk update jumlah keluar" });
    }

    // Update stok: tambahkan kembali jumlah lama, lalu kurangi dengan jumlah baru
    produk.jumlah += jumlahLama; // kembalikan dulu stok sebelumnya
    produk.jumlah -= jumlahBaru; // kurangi dengan jumlah baru
    await produk.save();

    keluarProduk.jumlah = jumlahBaru;
    keluarProduk.keterangan = keterangan || keluarProduk.keterangan;
    keluarProduk.jenisPengeluaran = jenisPengeluaran || keluarProduk.jenisPengeluaran;
    keluarProduk.tanggal = tanggal || keluarProduk.tanggal;

    const hargaTerbaru = produk.harga || keluarProduk.harga;
    keluarProduk.harga = hargaTerbaru;
    keluarProduk.total = hargaTerbaru * jumlahBaru;

    await keluarProduk.save();

    res.json({
      success: true,
      message: "Data berhasil diperbarui dan stok disesuaikan",
      data: keluarProduk,
    });
  } catch (error) {
    console.error("Kesalahan saat memperbarui data:", error.message);
    res.status(500).json({ success: false, message: "Kesalahan saat memperbarui data" });
  }
};


// Ambil data berdasarkan ID
const getDaftarKeluarProdukById = async (req, res) => {
  try {
    const { id } = req.params || req.body;
    const keluarProduk = await ProdukKeluarModel.findById(id);
    if (!keluarProduk) {
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });
    }
    const produk = await ProdukKeluarModel.findOne({
      namaProduk: keluarProduk.namaProduk,
    });
    const harga = produk ? produk.harga : keluarProduk.harga;
    const total = harga * keluarProduk.jumlah;
    const data = {
      ...keluarProduk.toObject(),
      harga,
      total,
    };
    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Gagal mengambil data produk keluar by Id:", error.message);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

export {
  addDaftarKeluarProduk,
  listDaftarKeluarProduk,
  removeDaftarKeluarProduk,
  editDaftarKeluarProduk,
  getDaftarKeluarProdukById,
};
