import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const Checkout = ({ cartItems, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customerGender, setCustomerGender] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [uangDibayar, setUangDibayar] = useState("");

  const navigate = useNavigate();
  const kasir = JSON.parse(localStorage.getItem("user"))?.username || "Kasir";
  console.log(kasir)

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);

  const parseRupiah = (str) =>
    Number(str.replace(/\./g, "").replace(/[^0-9]/g, "")) || 0;

  const handleUangDibayarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setUangDibayar("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(Number(raw));
    setUangDibayar(formatted);
  };

  const rekeningDummy = {
    transfer_bca: {
      bank: "BCA",
      norek: "1234567890",
      nama: "PT. Contoh BCA",
    },
    transfer_mandiri: {
      bank: "Mandiri",
      norek: "9876543210",
      nama: "PT. Contoh Mandiri",
    },
    transfer_bni: {
      bank: "BNI",
      norek: "1122334455",
      nama: "PT. Contoh BNI",
    },
  };

  const paymentLabels = {
    tunai: "Tunai",
    qris: "QRIS (All Payment)",
    transfer_bca: "Transfer Bank BCA",
    transfer_mandiri: "Transfer Bank Mandiri",
    transfer_bni: "Transfer Bank BNI",
    gopay: "GoPay",
    ovo: "OVO",
    shopeepay: "ShopeePay",
    debit_kredit: "Kartu Debit/Kredit",
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.harga * item.quantity,
    0
  );
  const discountAmount = (discountPercent / 100) * subtotal;
  const total = Math.max(subtotal - discountAmount, 0);
  const uangDibayarValue = parseRupiah(uangDibayar);
  const kembalian = paymentMethod === "tunai" ? uangDibayarValue - total : 0;

  const waktuTransaksi = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const cetakStruk = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Struk Pembayaran", 80, 10);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${waktuTransaksi}`, 14, 20);
    doc.text(`Kasir: ${kasir}`, 14, 26);
    doc.text(`Pembeli: ${customerName || "-"}`, 14, 32);
    doc.text(`Gender: ${customerGender}`, 14, 38);
    doc.text(`Metode: ${paymentLabels[paymentMethod]}`, 14, 44);

    autoTable(doc, {
      startY: 50,
      head: [["Produk", "Jumlah", "Harga Satuan", "Subtotal"]],
      body: cartItems.map((item) => [
        item.namaProduk,
        item.quantity,
        formatRupiah(item.harga),
        formatRupiah(item.harga * item.quantity),
      ]),
    });

    const y = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${formatRupiah(subtotal)}`, 14, y);
    doc.text(`Diskon: ${formatRupiah(discountAmount)}`, 14, y + 6);
    doc.text(`Total: ${formatRupiah(total)}`, 14, y + 12);

    if (paymentMethod === "tunai") {
      doc.text(`Dibayar: ${formatRupiah(uangDibayarValue)}`, 14, y + 18);
      doc.text(`Kembalian: ${formatRupiah(kembalian)}`, 14, y + 24);
    }

    doc.save(`struk-${Date.now()}.pdf`);
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      return Swal.fire("Pilih Metode Pembayaran!", "", "warning");
    }

    if (paymentMethod === "tunai" && uangDibayarValue < total) {
      return Swal.fire("Uang tidak mencukupi", "", "error");
    }

    const data = {
      cartItems,
      paymentMethod,
      customerGender,
      customerName,
      discountPercent,
      subtotal,
      total,
      kasir,
      waktuTransaksi,
    };

    try {
      const response = await fetch(
        "http://localhost:4000/api/checkout/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        await Promise.all(
          cartItems.map((item) =>
            fetch("http://localhost:4000/api/food/kurangi-stok", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: item._id, jumlah: item.quantity }),
            })
          )
        );

        cetakStruk();

        Swal.fire({
          icon: "success",
          title: "Pembayaran Berhasil!",
          html: `
            Metode: <b>${paymentLabels[paymentMethod]}</b><br/>
            Total: <b>${formatRupiah(total)}</b><br/>
            ${
              paymentMethod === "tunai"
                ? `Kembalian: <b>${formatRupiah(kembalian)}</b><br/>`
                : ""
            }
            Struk telah dicetak.
          `,
        }).then(() => navigate("/daftarPemasukan"));
      } else {
        Swal.fire("Gagal Checkout", "Terjadi kesalahan saat menyimpan.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Kesalahan Sistem", "Tidak dapat terhubung ke server.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Checkout</h2>

      <div className="mb-4">
        <label className="text-sm font-medium">Nama Pembeli:</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border p-2 rounded mt-1"
          placeholder="Opsional"
        />
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Produk:</h3>
        <div className="space-y-2 text-sm">
          {cartItems.map((item, i) => (
            <div key={i} className="border-b pb-2">
              <p className="font-medium">{item.namaProduk}</p>
              <p>Jumlah: {item.quantity}</p>
              <p>Harga: {formatRupiah(item.harga)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">Diskon (%):</label>
        <input
          type="number"
          value={discountPercent}
          onChange={(e) =>
            setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))
          }
          className="ml-2 border px-2 py-1 rounded w-24 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Diskon: {formatRupiah(discountAmount)}
        </p>
      </div>

      <div className="text-xl font-bold text-green-600 mb-6">
        Total: {formatRupiah(total)}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Jenis Kelamin:</label>
        <div className="space-x-4 text-sm">
          <label>
            <input
              type="radio"
              name="gender"
              value="Pria"
              onChange={(e) => setCustomerGender(e.target.value)}
            />{" "}
            Pria
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Wanita"
              onChange={(e) => setCustomerGender(e.target.value)}
            />{" "}
            Wanita
          </label>
        </div>
      </div>

      <div className="mb-6">
        <label className="font-medium mb-1 block">Metode Pembayaran:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Pilih --</option>
          {Object.keys(paymentLabels).map((key) => (
            <option key={key} value={key}>
              {paymentLabels[key]}
            </option>
          ))}
        </select>

        {paymentMethod === "qris" && (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm font-medium mb-2">Scan QRIS:</p>
            <img
              src="https://via.placeholder.com/250x250.png?text=QRIS"
              alt="QRIS"
              className="w-48 h-48 border rounded"
            />
          </div>
        )}

        {paymentMethod.startsWith("transfer_") &&
          rekeningDummy[paymentMethod] && (
            <div className="mt-4 p-4 bg-gray-50 border rounded text-sm">
              <p>
                <b>{rekeningDummy[paymentMethod].bank}</b>
              </p>
              <p>No. Rek: {rekeningDummy[paymentMethod].norek}</p>
              <p>Atas Nama: {rekeningDummy[paymentMethod].nama}</p>
            </div>
          )}

        {paymentMethod === "tunai" && (
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Uang Dibayar (Tunai):
            </label>
            <input
              type="text"
              value={uangDibayar}
              onChange={handleUangDibayarChange}
              className="w-full border p-2 rounded mt-1"
              placeholder="Masukkan contoh: 200.000"
            />
            {uangDibayar && kembalian >= 0 && (
              <p className="text-sm mt-1 text-green-700">
                Kembalian: {formatRupiah(kembalian)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => onBack([])}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
        >
          Kembali
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
        >
          Konfirmasi Pembayaran
        </button>
      </div>
    </div>
  );
};

export default Checkout;
