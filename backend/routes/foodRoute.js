import express from 'express'
import { addFood,listFood,removeFood,editFood, editIdFood, kurangiStokFood } from '../controllers/foodController.js'
import multer from 'multer'

const foodRouter = express.Router()

// image storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Pastikan folder "uploads" ada
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

    const upload = multer({storage:storage})

foodRouter.post("/add",upload.single("image"),addFood)
foodRouter.get("/list",listFood)
foodRouter.post("/remove",removeFood)
foodRouter.post("/edit", upload.single("image"), editFood);
foodRouter.get("/edit/:id", editIdFood);
foodRouter.post("/kurangi-stok", kurangiStokFood);






    


export default foodRouter