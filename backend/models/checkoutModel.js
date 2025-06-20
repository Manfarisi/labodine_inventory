import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  namaProduk: String,
  harga: Number,
  quantity: Number,
});

const checkoutSchema = new mongoose.Schema(
  {
    cartItems: [cartItemSchema],
    paymentMethod: String,
    customerGender: String,
    discountPercent: Number,
    subtotal: Number,
    total: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Checkout", checkoutSchema);
