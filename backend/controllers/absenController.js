import absenModel from '../models/absenModel.js';

// Tambah data absen
const tambahAbsen = async (req, res) => {
  try {
    const { username, status, keterangan } = req.body;
    console.log(req.body)
    const absenBaru = new absenModel({
      username,
      status,
      keterangan
    });

    const hasil = await absenBaru.save();
    res.status(201).json(hasil);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Gagal menambahkan absen', error });
  }
};

// Ambil semua data absen
const getAllAbsen = async (req, res) => {
  try {
    const data = await absenModel.find().populate('username', 'name'); // populasi nama user
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data absen', error });
  }
};

// Ambil absen berdasarkan ID
const getAbsenById = async (req, res) => {
  try {
    const absen = await absenModel.findById(req.params.id).populate('username', 'nama');
    if (!absen) return res.status(404).json({ message: 'Absen tidak ditemukan' });
    res.json(absen);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil absen', error });
  }
};

// Update absen
const updateAbsen = async (req, res) => {
  try {
    const { status, keterangan } = req.body;

    const absen = await absenModel.findByIdAndUpdate(
      req.params.id,
      {
        status,
        keterangan,
        tanggal: new Date(), // <- Perbarui tanggal dan jam saat edit
      },
      { new: true }
    );

    if (!absen) return res.status(404).json({ message: 'Absen tidak ditemukan' });
    res.json(absen);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate absen', error });
  }
};

// Hapus absen
const hapusAbsen = async (req, res) => {
  try {
    const absen = await absenModel.findByIdAndDelete(req.params.id);
    if (!absen) return res.status(404).json({ message: 'Absen tidak ditemukan' });
    res.json({ message: 'Absen berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus absen', error });
  }
};
// Hapus semua absen berdasarkan user ID
const hapusAbsenByUserId = async (req, res) => {
  try {
    const username = req.params.username;
    const hasil = await absenModel.deleteMany({ username: username });
    res.json({
      message: `Semua absen untuk user ${username} berhasil dihapus.`,
      deletedCount: hasil.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data absen user', error });
  }
};


export {tambahAbsen,getAllAbsen,getAbsenById,hapusAbsen,updateAbsen,hapusAbsenByUserId}