import foodModel from '../models/foodModel.js';
import produkKeluarModel from '../models/produkKeluarModel.js';
import fs from 'fs';

// === FOOD (Stok Utama) ===

const addFood = async (req, res) => {
    const image_filename = `${req.file.filename}`;

    const food = new foodModel({
        namaProduk: req.body.namaProduk,
        harga: Number(req.body.harga),
        jumlah: Number(req.body.jumlah),
        keterangan: req.body.keterangan,
        kategori: req.body.kategori,
        hpp: req.body.hpp,
        image: image_filename
    });

    try {
        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => {});

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const editFood = async (req, res) => {
    try {
        const { id, namaProduk, harga, hpp, keterangan, jumlah, kategori } = req.body;
        const food = await foodModel.findById(id);
        if (!food) return res.status(404).json({ success: false, message: "Food not found" });

        let image_filename = food.image;
        if (req.file) {
            fs.unlink(`uploads/${food.image}`, () => {});
            image_filename = req.file.filename;
        }

        food.namaProduk = namaProduk || food.namaProduk;
        food.harga = harga || food.harga;
        food.keterangan = keterangan || food.keterangan;
        food.jumlah = jumlah || food.jumlah;
        food.hpp = hpp || food.hpp;
        food.kategori = kategori || food.kategori;
        food.image = image_filename;

        await food.save();
        res.json({ success: true, message: "Food updated", data: food });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Update Error" });
    }
};

const editIdFood = async (req, res) => {
    try {
        const { id } = req.params || req.body;
        const food = await foodModel.findById(id);
        if (!food) return res.status(404).json({ success: false, message: "Food not found" });

        let image_filename = food.image;
        if (req.file) {
            fs.unlink(`uploads/${food.image}`, () => {});
            image_filename = req.file.filename;
        }

        food.image = image_filename;
        await food.save();

        res.json({ success: true, data: food });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

const kurangiStokFood = async (req, res) => {
  try {
    const { id, namaProduk, jumlah } = req.body;

    // Validasi input jumlah
    if (!jumlah || isNaN(jumlah) || jumlah <= 0) {
      return res.status(400).json({ success: false, message: "Jumlah tidak valid." });
    }

    // Temukan produk berdasarkan ID atau nama (case-insensitive)
    const produk = id
      ? await foodModel.findById(id)
      : await foodModel.findOne({ namaProduk: new RegExp(`^${namaProduk.trim()}$`, "i") });

    if (!produk) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
    }

    // Cek ketersediaan stok
    if (produk.jumlah < jumlah) {
      return res.status(400).json({ success: false, message: `Stok tidak mencukupi. Tersisa ${produk.jumlah}` });
    }

    // Kurangi stok
    produk.jumlah -= jumlah;
    await produk.save();

    res.json({
      success: true,
      message: `Stok berhasil dikurangi sebanyak ${jumlah}`,
      data: produk,
    });
  } catch (error) {
    console.error("Gagal mengurangi stok:", error.message);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};



export {
    // Food
    addFood,
    listFood,
    removeFood,
    editFood,
    editIdFood,
    kurangiStokFood
};
