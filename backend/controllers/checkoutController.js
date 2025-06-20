import checkoutModel from "../models/checkoutModel.js";
import pemasukanModel from "../models/pemasukanModel.js";

// ✅ Tambah data checkout + simpan ke pemasukan
export const tambahCheckout = async (req, res) => {
  const {
    cartItems,
    paymentMethod,
    customerGender,
    discountPercent,
    subtotal,
    total
  } = req.body;

  const checkout = new checkoutModel({
    cartItems,
    paymentMethod,
    customerGender,
    discountPercent,
    subtotal,
    total
  });

  try {
    await checkout.save();

    // Simpan juga ke pemasukan
    const items = cartItems.map(item => ({
      namaProduk: item.namaProduk,
      jumlah: item.jumlah,
      hargaSatuan: item.harga,
      total: item.harga * item.jumlah
    }));

    const pemasukan = new pemasukanModel({
      items,
      totalPemasukan: total,
      keterangan: `Checkout by ${customerGender || 'Customer'}`,
      tanggal: new Date(),
      checkoutId: checkout._id, // Tambahkan relasi agar bisa dihapus nanti
    });

    await pemasukan.save();

    res.json({ success: true, message: "Checkout & pemasukan berhasil disimpan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal menyimpan checkout & pemasukan" });
  }
};

// ✅ Tampilkan semua data pemasukan dari checkout
export const daftarCheckout = async (req, res) => {
  try {
    const data = await checkoutModel.find().sort({ createdAt: -1 }); // terbaru dulu
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil data checkout" });
  }
};

// ✅ Hapus data checkout & pemasukan yang terkait
export const hapusCheckout = async (req, res) => {
  const { id } = req.params;
  try {
    const checkout = await checkoutModel.findByIdAndDelete(id);
    if (!checkout) {
      return res.status(404).json({ success: false, message: "Checkout tidak ditemukan" });
    }

    // Hapus juga pemasukan yang terkait
    await pemasukanModel.deleteOne({ checkoutId: id });

    res.json({ success: true, message: "Checkout & pemasukan terkait berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal menghapus data checkout" });
  }
};

