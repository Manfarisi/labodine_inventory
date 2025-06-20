import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    namaProduk: {type:String,required:true},
    keterangan: {type:String,required:true},
    harga: {type:Number,required:true},
    jumlah: {type:Number,required:true},
    kategori: {type:String,required:true,     
        enum: ['Hampers', 'Frozen', 'Paket Mini Frozen', 'Paket Matang', 'Hampers Neela Klappertart',], 
},
    image: {type:String,required:true},
    hpp: {type:Number,required:true},
},{ timestamps: true })

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema)
export default foodModel;