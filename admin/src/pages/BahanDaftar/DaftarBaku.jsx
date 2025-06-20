import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaInbox, FaPlus, FaEdit, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";

const DaftarBaku = ({ url }) => {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalBahan = list.length;

  const itemsPerPage = 8;
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/bahanBaku/daftarBahanBaku`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Gagal mengambil data!");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengambil data!");
    }
  };

  const hapusBahanBaku = async (id) => {
    try {
      const response = await axios.post(`${url}/api/bahanBaku/hapusBahanBaku`, { id });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Gagal menghapus data!");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus data!");
    }
  };

  const editBahanBaku = (id) => navigate(`/daftarBaku/edit/${id}`);

  const formatTanggal = (isoDate) => {
    const tanggal = new Date(isoDate);
    return tanggal.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = list.filter((item) => {
    const cocokNama = item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase());
    const cocokTanggal = filterTanggal
      ? new Date(item.tanggal).toISOString().slice(0, 10) === filterTanggal
      : true;
    const cocokJenis = filterJenis ? item.jenisPemasukan === filterJenis : true;
    return cocokNama && cocokTanggal && cocokJenis;
  });

  const lowStockItems = filteredList.filter((item) => item.jumlah < 10);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const changePage = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daftar Barang Masuk</h1>
            <p className="text-sm text-gray-500">Manajemen data bahan baku masuk</p>
          </div>
          <button
            onClick={() => navigate("/masuk")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <FaPlus /> Tambah Barang
          </button>
        </div>

        {lowStockItems.length > 0 && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md flex items-center space-x-3">
            <FaExclamationTriangle className="w-5 h-5" />
            <p>
              Terdapat <strong>{lowStockItems.length}</strong> produk dengan stok rendah. Segera lakukan penambahan stok!
            </p>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-1/3"
          />
          <input
            type="date"
            value={filterTanggal}
            onChange={(e) => {
              setFilterTanggal(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-1/4"
          />
          <select
            value={filterJenis}
            onChange={(e) => {
              setFilterJenis(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-1/4"
          >
            <option value="">Semua Jenis</option>
            <option value="Pembelian">Pembelian</option>
            <option value="Retur">Retur</option>
            <option value="Donasi">Donasi</option>
          </select>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
                    <div className="mb-4 text-gray-600">
  Total Bahan Tersedia: <strong>{list.length}</strong>
</div>
          <table className="w-full text-sm text-left text-gray-700 border">
            <thead className="text-xs text-white uppercase bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-center text-base">Nama Barang</th>
                <th className="px-4 py-2 text-center text-base">Jumlah</th>
                <th className="px-4 py-2 text-center text-base">Satuan</th>
                <th className="px-4 py-2 text-center text-base">Tanggal Masuk</th>
                <th className="px-4 py-2 text-center text-base">Jenis Pemasukan</th>
                <th className="px-4 py-2 text-center text-base">Keterangan</th>
                <th className="px-4 py-2 text-center text-base">Stock</th>
                <th className="px-4 py-2 text-center text-base">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="px-4 py-2 text-center text-base">{item.namaBarang}</td>
                    <td className="px-4 py-2 text-center text-base">{item.jumlah}</td>
                    <td className="px-4 py-2 text-center text-base">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {item.satuan}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-base">{formatTanggal(item.tanggal)}</td>
                    <td className="px-4 py-2 text-center text-base">{item.jenisPemasukan}</td>
<td className="px-4 py-2 text-center text-base whitespace-pre-wrap">{item.keterangan}</td>
                    <td className="px-4 py-2 text-center text-base">
                      {item.jumlah <= 5 ? (
                        <span className="text-red-600 font-semibold">Stok hampir habis</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Stok tercukupi</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center text-base">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => editBahanBaku(item._id)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => hapusBahanBaku(item._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <FaInbox size={40} />
                      <h3 className="text-lg font-semibold">Tidak ada data tersedia</h3>
                      <p>Tambahkan data bahan baku untuk mulai.</p>
                      <button
                        onClick={() => navigate("/masuk")}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                      >
                        <FaPlus /> Tambah Barang
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => changePage("prev")}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100"
              }`}
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => changePage("next")}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage === totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white hover:bg-gray-100"
              }`}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaftarBaku;
