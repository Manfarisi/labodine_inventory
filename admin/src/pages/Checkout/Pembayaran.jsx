import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const Checkout = ({ cartItems, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customerGender, setcustomerGender] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const navigate = useNavigate();
  const kasir = JSON.parse(localStorage.getItem("user"))?.name || "Kasir";

  const qrisImage = "https://via.placeholder.com/250x250.png?text=QRIS"; // Ganti URL ini ke gambar QRIS asli jika ada

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

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.harga * item.quantity,
    0
  );
  const discountAmount = (discountPercent / 100) * subtotal;
  const total = Math.max(subtotal - discountAmount, 0);

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
    doc.text(`Metode: ${paymentLabels[paymentMethod]}`, 14, 32);
    doc.text(`Gender: ${customerGender}`, 14, 38);

    autoTable(doc, {
      startY: 44,
      head: [["Produk", "Jumlah", "Harga Satuan", "Subtotal"]],
      body: cartItems.map((item) => [
        item.namaProduk,
        item.quantity,
        `Rp ${item.harga.toLocaleString()}`,
        `Rp ${(item.harga * item.quantity).toLocaleString()}`,
      ]),
    });

    doc.text(
      `Subtotal: Rp ${subtotal.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );
    doc.text(
      `Diskon: Rp ${discountAmount.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 16
    );
    doc.text(
      `Total: Rp ${total.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 22
    );

    doc.save(`struk-${Date.now()}.pdf`);
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      Swal.fire({
        icon: "warning",
        title: "Metode pembayaran belum dipilih",
        text: "Silakan pilih metode pembayaran terlebih dahulu.",
      });
      return;
    }

    const data = {
      cartItems,
      paymentMethod,
      customerGender,
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
              body: JSON.stringify({
                id: item._id,
                jumlah: item.quantity,
              }),
            })
          )
        );

        cetakStruk();

        Swal.fire({
          icon: "success",
          title: "Pembayaran Berhasil!",
          html: `
          Pembayaran melalui <b>${paymentLabels[paymentMethod]}</b><br/>
          Total: <b>Rp ${total.toLocaleString()}</b><br/>
          Struk telah dicetak.
        `,
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/daftarPemasukan");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Checkout",
          text: "Terjadi kesalahan saat menyimpan transaksi.",
        });
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      Swal.fire({
        icon: "error",
        title: "Kesalahan Sistem",
        text: "Tidak dapat terhubung ke server.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      <div className="mb-6">
        <div className="mt-4">
          <h4 className="text-md font-semibold mb-2">Detail Produk:</h4>
          <div className="space-y-2 text-sm text-gray-700">
            {cartItems.map((item, index) => (
              <div key={index} className="border-b pb-2">
                <p className="font-medium">{item.namaProduk}</p>
                <p>Jumlah: {item.quantity}</p>
                <p>Harga Satuan: Rp {item.harga.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Diskon (%): </label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="ml-2 border px-2 py-1 rounded w-24 text-sm"
            placeholder="Contoh: 10"
            min="0"
            max="100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Diskon: Rp {discountAmount.toLocaleString()}
          </p>
        </div>

        <p className="mt-2 font-bold text-lg text-green-700">
          Total: Rp {total.toLocaleString()}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Pembeli Saat Ini:</h3>
        <div className="space-y-2">
          <label className="block">
            <input
              type="radio"
              name="gender"
              value="Pria"
              onChange={(e) => setcustomerGender(e.target.value)}
            />
            <span className="ml-2">Pria</span>
          </label>
          <label className="block">
            <input
              type="radio"
              name="gender"
              value="Wanita"
              onChange={(e) => setcustomerGender(e.target.value)}
            />
            <span className="ml-2">Wanita</span>
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Pilih Metode Pembayaran:</h3>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border p-2 rounded text-sm"
        >
          <option value="">-- Pilih Metode Pembayaran --</option>
          <option value="tunai">Tunai</option>
          <option value="qris">QRIS (All Payment)</option>
          <option value="transfer_bca">Transfer Bank BCA</option>
          <option value="transfer_mandiri">Transfer Bank Mandiri</option>
          <option value="transfer_bni">Transfer Bank BNI</option>
          <option value="gopay">GoPay</option>
          <option value="ovo">OVO</option>
          <option value="shopeepay">ShopeePay</option>
          <option value="debit_kredit">Kartu Debit/Kredit</option>
        </select>
        {paymentMethod === "qris" && (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm font-medium mb-2">
              Scan QRIS untuk Pembayaran:
            </p>
            <img
              src={qrisImage}
              alt="QRIS Code"
              className="w-48 h-48 object-contain border rounded"
            />
          </div>
        )}

        {paymentMethod.startsWith("transfer_") &&
          rekeningDummy[paymentMethod] && (
            <div className="mt-4 p-4 border rounded bg-gray-50 text-sm">
              <p className="font-medium">
                Transfer ke Rekening {rekeningDummy[paymentMethod].bank}:
              </p>
              <p>
                No. Rekening:{" "}
                <span className="font-semibold">
                  {rekeningDummy[paymentMethod].norek}
                </span>
              </p>
              <p>
                Atas Nama:{" "}
                <span className="font-semibold">
                  {rekeningDummy[paymentMethod].nama}
                </span>
              </p>
            </div>
          )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => onBack([])}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
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
