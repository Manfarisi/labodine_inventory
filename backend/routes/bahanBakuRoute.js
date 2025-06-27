import express from 'express'
import { bahanBakuMasuk, daftarBahanBaku, daftarBahanKeluar, editBahanBaku, editBahanKeluar, editIdBahanBaku, editIdBahanKeluar, getBahanById, hapusBahanBaku, hapusBahanKeluar, kurangiBahanBaku } from '../controllers/barangMasukController.js'

const bahanBakuRouter = express.Router()

bahanBakuRouter.post("/bahanBakuMasuk",bahanBakuMasuk)
bahanBakuRouter.get("/daftarBahanBaku",daftarBahanBaku)
bahanBakuRouter.get("/detail/:id",getBahanById)
bahanBakuRouter.post("/hapusBahanBaku",hapusBahanBaku)
bahanBakuRouter.post("/editBahanBaku",editBahanBaku)
bahanBakuRouter.get("/editBahanBaku/:id",editIdBahanBaku)


bahanBakuRouter.post("/kurangiBahanBaku",kurangiBahanBaku)
bahanBakuRouter.get("/daftarBarangTersisa",daftarBahanKeluar)
bahanBakuRouter.post("/editBahanKeluar",editBahanKeluar)
bahanBakuRouter.get("/editBahanKeluar/:id",editIdBahanKeluar)
bahanBakuRouter.post("/hapusBahanKeluar",hapusBahanKeluar)


export default bahanBakuRouter
