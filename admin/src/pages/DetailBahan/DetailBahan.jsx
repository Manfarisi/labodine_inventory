import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DetailBahan = () => {
  const { id } = useParams();
  const [bahan, setBahan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBahan = async () => {
      try {
        const res = await axios.get(`/api/bahanBaku/detail/${id}`);
        if (res.data.success) {
          setBahan(res.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat detail bahan", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBahan();
  }, [id]);

  if (loading) return <p className="p-4">Memuat...</p>;
  if (!bahan) return <p className="p-4 text-red-500">Bahan tidak ditemukan.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">{bahan.namaBarang}</h2>
      <p className="text-gray-700">Stok: {bahan.jumlah}</p>
      <p className="text-gray-700">Harga Beli: Rp {bahan.hpp}</p>
      <p className="text-gray-500">{bahan.keterangan}</p>
    </div>
  );
};

export default DetailBahan;
