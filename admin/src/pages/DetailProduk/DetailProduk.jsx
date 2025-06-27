import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DetailProduk = () => {
  const { id } = useParams();
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const res = await axios.get(`/api/food/detail/${id}`);
        if (res.data.success) {
          setProduk(res.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat detail produk", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduk();
  }, [id]);

  if (loading) return <p className="p-4">Memuat...</p>;
  if (!produk) return <p className="p-4 text-red-500">Produk tidak ditemukan.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">{produk.namaProduk}</h2>
      <p className="text-gray-700">Harga: Rp {produk.harga}</p>
      <p className="text-gray-700">Stok: {produk.jumlah}</p>
      <p className="text-gray-500">{produk.keterangan}</p>
      {produk.image && (
        <img src={produk.image} alt={produk.namaProduk} className="w-full rounded-lg" />
      )}
    </div>
  );
};

export default DetailProduk;
