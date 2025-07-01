import bahanBakuModel from "../models/bahanBakuModel.js";
import fs from "fs";
import BahanBakuKeluarModel from "../models/bahanKeluarModels.js";

const bahanBakuMasuk = async (req, res) => {
  const bahanBaku = new bahanBakuModel({
    namaBarang: req.body.namaBarang,
    jumlah: req.body.jumlah,
    satuan: req.body.satuan,
    keterangan: req.body.keterangan,
    jenisPemasukan: req.body.jenisPemasukan,
    tanggal: req.body.tanggal,
  });

  try {
    await bahanBaku.save();
    res.json({ success: true, message: "Bahan Baku Berhasil Ditambahkan" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const daftarBahanBaku = async (req, res) => {
  try {
    const bahanBaku = await bahanBakuModel.find({}).sort({ tanggal: -1 });
    res.json({ success: true, data: bahanBaku });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// hapus bahan baku item
const hapusBahanBaku = async (req, res) => {
  try {
    const bahanBaku = await bahanBakuModel.findById(req.body.id);
    await bahanBakuModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Bahan Baku Berhasil Dihapus" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// edit bahan baku
const editBahanBaku = async (req, res) => {
  try {
    const {
      id,
      namaBarang,
      jumlah,
      satuan,
      keterangan,
      tanggal,
      jenisPemasukan,
    } = req.body;

    const bahanBaku = await bahanBakuModel.findById(id);
    if (!bahanBaku) {
      return res
        .status(404)
        .json({ success: false, message: "Bahan Baku tidak ditemukan" });
    }

    // Update data bahan baku
    bahanBaku.namaBarang = namaBarang || bahanBaku.namaBarang;
    bahanBaku.jumlah = jumlah || bahanBaku.jumlah;
    bahanBaku.satuan = satuan || bahanBaku.satuan;
    bahanBaku.keterangan = keterangan || bahanBaku.keterangan;
    bahanBaku.jenisPemasukan = jenisPemasukan || bahanBaku.jenisPemasukan;
    bahanBaku.tanggal = tanggal || bahanBaku.tanggal;
    // bahanBaku.image = image_filename; // jika pakai upload gambar

    await bahanBaku.save();
    res.json({
      success: true,
      message: "Bahan Baku berhasil diperbarui",
      data: bahanBaku,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui Bahan Baku",
    });
  }
};

const editIdBahanBaku = async (req, res) => {
  try {
    const { id } = req.params || req.body;

    const bahanBaku = await bahanBakuModel.findById(id);
    if (!bahanBaku) {
      return res
        .status(404)
        .json({ success: false, message: "Bahan Baku tidak ditemukan" });
    }

    // Update data
    bahanBaku.namaBarang = req.body.namaBarang || bahanBaku.namaBarang;
    bahanBaku.jumlah = req.body.jumlah || bahanBaku.jumlah;
    bahanBaku.keterangan = req.body.keterangan || bahanBaku.keterangan;
    bahanBaku.satuan = req.body.satuan || bahanBaku.satuan;
    bahanBaku.jenisPemasukan =
      req.body.jenisPemasukan || bahanBaku.jenisPemasukan;
    bahanBaku.tanggal = req.body.tanggal || bahanBaku.tanggal;

    await bahanBaku.save();

    res.json({
      success: true,
      message: "Bahan Baku berhasil diperbarui",
      data: bahanBaku,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui Bahan Baku",
    });
  }
};

// controller barang keluar untuk barang baku
const kurangiBahanBaku = async (req, res) => {
  try {
    console.log("🟡 Request masuk ke kurangiBahanBaku");
    console.log("📥 Data dari req.body:", req.body);

    const {
      namaBarang,
      jumlah,
      satuan,
      jenisPengeluaran,
      keterangan,
      tanggal,
    } = req.body;

    const jumlahAngka = Number(jumlah);
    if (!namaBarang || isNaN(jumlahAngka) || jumlahAngka <= 0) {
      console.warn("⚠️ Validasi gagal: namaBarang/jumlah tidak valid");
      return res.status(400).json({
        success: false,
        message: "Nama barang dan jumlah harus diisi dengan benar",
      });
    }

    const bahanBaku = await bahanBakuModel.findOne({ namaBarang });
    if (!bahanBaku) {
      console.warn("❌ Bahan baku tidak ditemukan:", namaBarang);
      return res.status(404).json({
        success: false,
        message: "Bahan Baku tidak ditemukan",
      });
    }

    console.log("✅ Bahan baku ditemukan:", bahanBaku);

    const satuanInput = (satuan || "").trim();
    const satuanAsli = (bahanBaku.satuan || "").trim();
    console.log("🔍 Validasi satuan:", { satuanInput, satuanAsli });

    if (satuanInput !== satuanAsli) {
      console.warn("❌ Satuan tidak cocok");
      return res.status(400).json({
        success: false,
        message: `Satuan tidak sesuai. Harusnya '${satuanAsli}'`,
      });
    }

    if (jumlahAngka > bahanBaku.jumlah) {
      console.warn("❌ Jumlah melebihi stok:", {
        diminta: jumlahAngka,
        tersedia: bahanBaku.jumlah,
      });
      return res.status(400).json({
        success: false,
        message: "Jumlah melebihi stok yang tersedia",
      });
    }

    // Kurangi stok
    bahanBaku.jumlah -= jumlahAngka;
    await bahanBaku.save();
    console.log("✅ Jumlah berhasil dikurangi, stok baru:", bahanBaku.jumlah);

    // Simpan log pengeluaran
    const logData = {
      namaBarang,
      jumlah: jumlahAngka,
      satuan: satuanInput,
      jenisPengeluaran,
      keterangan,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
    };

    console.log("📝 Mencatat log pengeluaran:", logData);

    try {
      const result = await BahanBakuKeluarModel.create(logData);
      console.log("✅ Log pengeluaran berhasil disimpan:", result);
    } catch (error) {
      console.error("❌ Gagal menyimpan log pengeluaran:", error.message);
      console.error("🔎 DETAIL:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengurangi bahan baku (log gagal)",
      });
    }

    res.json({
      success: true,
      message: "Jumlah bahan baku berhasil dikurangi dan log dicatat",
      data: bahanBaku,
    });
  } catch (error) {
    console.error("❌ ERROR SERVER:", error.message);
    console.error("🔎 DETAIL:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengurangi bahan baku",
    });
  }
};



const daftarBahanKeluar = async (req, res) => {
  try {
    
    const dataKeluar = await BahanBakuKeluarModel.find({}).sort({
      tanggal: -1,
    }); // urut terbaru dulu
    res.json({
      success: true,
      message: "Daftar bahan baku yang keluar berhasil diambil",
      data: dataKeluar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data bahan baku yang keluar",
    });
  }
};

const editBahanKeluar = async (req, res) => {
  try {
    const {
      id,
      namaBarang,
      jumlah,
      satuan,
      keterangan,
      tanggal,
      jenisPengeluaran,
    } = req.body;

    const bahan = await BahanBakuKeluarModel.findById(id); // hanya jika modelnya sama
    if (!bahan) {
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });
    }

    // Update data
    bahan.namaBarang = namaBarang || bahan.namaBarang;
    bahan.jumlah = jumlah || bahan.jumlah;
    bahan.satuan = satuan || bahan.satuan;
    bahan.keterangan = keterangan || bahan.keterangan;
    bahan.tanggal = tanggal || bahan.tanggal;
    bahan.jenisPengeluaran = jenisPengeluaran || bahan.jenisPengeluaran;

    // Update jenis sesuai konteks
    if (jenisPengeluaran) bahan.jenisPengeluaran = jenisPengeluaran;

    await bahan.save();

    res.json({
      success: true,
      message: "Data berhasil diperbarui",
      data: bahan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data",
    });
  }
};

const editIdBahanKeluar = async (req, res) => {
  try {
    const { id } = req.params || req.body;

    const bahanKeluar = await BahanBakuKeluarModel.findById(id); // Pastikan model ini ada
    if (!bahanKeluar) {
      return res
        .status(404)
        .json({ success: false, message: "Bahan Keluar tidak ditemukan" });
    }

    // Hanya mengizinkan perubahan pada jumlah, keterangan, jenisPengeluaran, dan tanggal
    bahanKeluar.jumlah = req.body.jumlah || bahanKeluar.jumlah;
    bahanKeluar.keterangan = req.body.keterangan || bahanKeluar.keterangan;
    bahanKeluar.jenisPengeluaran =
      req.body.jenisPengeluaran || bahanKeluar.jenisPengeluaran;
    bahanKeluar.tanggal = req.body.tanggal || bahanKeluar.tanggal;

    await bahanKeluar.save();

    res.json({
      success: true,
      message: "Bahan Keluar berhasil diperbarui",
      data: bahanKeluar,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui Bahan Keluar",
    });
  }
};

const hapusBahanKeluar = async (req, res) => {
  try {
    const bahanKeluar = await BahanBakuKeluarModel.findById(req.body.id);
    if (!bahanKeluar) {
      return res
        .status(404)
        .json({ success: false, message: "Data bahan keluar tidak ditemukan" });
    }

    const bahanAsli = await bahanBakuModel.findOne({
      namaBarang: bahanKeluar.namaBarang,
    });

    if (!bahanAsli) {
      return res
        .status(404)
        .json({ success: false, message: "Bahan baku asal tidak ditemukan" });
    }

    // Kembalikan stok
    bahanAsli.jumlah += bahanKeluar.jumlah;
    await bahanAsli.save();

    // Hapus data bahan keluar
    await BahanBakuKeluarModel.findByIdAndDelete(req.body.id);

    res.json({
      success: true,
      message: "Bahan Baku Keluar berhasil dihapus dan stok diperbarui",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data",
    });
  }
};

const getBahanById = async (req, res) => {
  try {
    const { id } = req.params;
    const bahan = await bahanBakuModel.findById(id);

    if (!bahan) {
      return res.status(404).json({
        success: false,
        message: "Bahan baku tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: bahan,
    });
  } catch (error) {
    console.error("Gagal ambil detail bahan baku:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export {
  bahanBakuMasuk,
  daftarBahanBaku,
  hapusBahanBaku,
  getBahanById,
  editBahanBaku,
  editIdBahanBaku,
  kurangiBahanBaku,
  daftarBahanKeluar,
  editBahanKeluar,
  editIdBahanKeluar,
  hapusBahanKeluar,
};
