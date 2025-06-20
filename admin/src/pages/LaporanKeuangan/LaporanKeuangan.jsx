import React, { useEffect, useState } from "react";
import {
  FaWallet,
  FaFileAlt,
  FaTrashAlt,
  FaInbox,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const formatTanggal = (tanggal) => {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function LaporanKeuangan({ url }) {
  const [pemasukan, setPemasukan] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPemasukan = async () => {
      try {
        const res = await fetch(`${url}/api/checkout/daftarCheckout`);
        const data = await res.json();
        if (data.success) setPemasukan(data.data);
      } catch (err) {
        console.error("Gagal fetch pemasukan:", err);
      }
    };
    fetchPemasukan();
  }, [url]);

  useEffect(() => {
    const fetchPengeluaran = async () => {
      try {
        const res = await fetch(`${url}/api/pengeluaran/daftarPengeluaran`);
        const data = await res.json();
        if (data.success) setPengeluaran(data.data);
      } catch (err) {
        console.error("Gagal fetch pengeluaran:", err);
      }
    };
    fetchPengeluaran();
  }, [url]);

  const handleDeletePemasukan = async (id) => {
    if (window.confirm("Yakin ingin menghapus data pemasukan ini?")) {
      try {
        const res = await fetch(`${url}/api/checkout/hapusCheckout/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          setPemasukan((prev) => prev.filter((item) => item._id !== id));
        }
      } catch (err) {
        console.error("Gagal menghapus pemasukan:", err);
      }
    }
  };

  const handleDeletePengeluaran = async (id) => {
    if (window.confirm("Yakin ingin menghapus pengeluaran ini?")) {
      try {
        const res = await fetch(
          `${url}/api/pengeluaran/hapusPengeluaran/${id}`,
          {
            method: "DELETE",
          }
        );
        const data = await res.json();
        if (data.success) {
          setPengeluaran((prev) => prev.filter((item) => item._id !== id));
        }
      } catch (err) {
        console.error("Gagal menghapus pengeluaran:", err);
      }
    }
  };

  const editPengeluaran = (id) => {
    console.log("Edit pengeluaran dengan ID:", id);
  };

  const filterByDate = (data) => {
    const awal = tanggalAwal ? new Date(tanggalAwal) : null;
    const akhir = tanggalAkhir ? new Date(tanggalAkhir) : null;
    return data.filter((item) => {
      const tgl = new Date(item.createdAt || item.tanggal);
      return (!awal || tgl >= awal) && (!akhir || tgl <= akhir);
    });
  };

  const filteredPemasukan = filterByDate(pemasukan);
  const filteredPengeluaran = filterByDate(pengeluaran);

  const displayedPemasukan = filteredPemasukan.slice(0, 5);
  const displayedPengeluaran = filteredPengeluaran.slice(0, 5);

  const totalPemasukan = filteredPemasukan.reduce(
    (acc, item) => acc + item.total,
    0
  );
  const totalPengeluaran = filteredPengeluaran.reduce(
    (acc, item) => acc + Number(item.jumlah || 0),
    0
  );
  const hasil = totalPemasukan - totalPengeluaran;

  return (
    <div className="p-6 space-y-10">
      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Pemasukan</p>
              <h2 className="text-xl font-bold text-green-600">
                Rp {totalPemasukan.toLocaleString("id-ID")}
              </h2>
            </div>
            <FaWallet className="text-green-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Pengeluaran</p>
              <h2 className="text-xl font-bold text-red-600">
                Rp {totalPengeluaran.toLocaleString("id-ID")}
              </h2>
            </div>
            <FaFileAlt className="text-red-600 text-3xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Hasil</p>
              <h2
                className={`text-xl font-bold ${
                  hasil >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                Rp {hasil.toLocaleString("id-ID")}
              </h2>
            </div>
            <FaWallet className="text-blue-600 text-3xl" />
          </div>
        </div>
      </div>

      {/* Tabel Pemasukan */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-green-300 text-green-800">
              {[
                "No",
                "Tanggal",
                "Metode",
                "Gender",
                "Diskon",
                "Jumlah Item",
                "Produk",
                "Total",
                "Aksi",
              ].map((title) => (
                <th key={title} className="px-5 py-3 text-center font-semibold">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedPemasukan.length > 0 ? (
              displayedPemasukan.map((data, idx) => (
                <tr key={data._id} className="border-b hover:bg-blue-50">
                  <td className="px-5 py-3 text-center">{idx + 1}</td>
                  <td className="px-5 py-3 text-center">
                    {new Date(data.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {data.paymentMethod}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {data.customerGender || "-"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {data.discountPercent}%
                  </td>
                  <td className="px-5 py-3 text-center">
                    {data.cartItems.reduce(
                      (acc, item) => acc + item.quantity,
                      0
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <ul className="list-disc list-inside text-left">
                      {data.cartItems.map((item, i) => (
                        <li key={i}>
                          {item.namaProduk} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-3 text-green-600 font-semibold text-center">
                    Rp {data.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleDeletePemasukan(data._id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-10">
                  <div className="text-gray-500 flex flex-col items-center">
                    <FaInbox size={40} className="mb-3" />
                    Tidak ada data pemasukan ditemukan.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredPemasukan.length > 5 && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/daftarPemasukan")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Lihat Detail Pemasukan
            </button>
          </div>
        )}
      </div>

      {/* Tabel Pengeluaran */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-red-100 text-red-800">
              {[
                "No",
                "Nama",
                "Jumlah",
                "Jenis",
                "Tanggal",
                "Keterangan",
                "Aksi",
              ].map((title) => (
                <th
                  key={title}
                  className="px-5 py-3 text-center font-semibold text-base"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedPengeluaran.length > 0 ? (
              displayedPengeluaran.map((item, idx) => (
                <tr key={item._id} className="border-b hover:bg-red-50">
                  <td className="px-5 py-3 text-center">{idx + 1}</td>
                  <td className="px-5 py-3 text-center">
                    {item.namaPengeluaran}
                  </td>
                  <td className="px-5 py-3 text-center">
                    Rp {Number(item.jumlah).toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="bg-red-200 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {item.jenisPengeluaran}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {formatTanggal(item.tanggal)}
                  </td>
                  <td className="px-5 py-3 text-center">{item.keterangan}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => editPengeluaran(item._id)}
                        className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeletePengeluaran(item._id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <div className="text-gray-500 flex flex-col items-center">
                    <FaInbox size={40} className="mb-3" />
                    Tidak ada data pengeluaran ditemukan.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredPengeluaran.length > 5 && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/daftarPengeluaran")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Lihat Detail Pengeluaran
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LaporanKeuangan;
