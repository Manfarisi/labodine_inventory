import express from 'express'
import { daftarPengeluaran, editIdPengeluaran, editPengeluaran, hapusPengeluaran, pengeluaran } from '../controllers/pengeluaranController.js'

const pengeluaranRouter =  express.Router()

pengeluaranRouter.post("/pengeluaran",pengeluaran)
pengeluaranRouter.get("/daftarPengeluaran",daftarPengeluaran)
pengeluaranRouter.post("/hapusPengeluaran",hapusPengeluaran)
pengeluaranRouter.post("/editPengeluaran",editPengeluaran)
pengeluaranRouter.get("/editPengeluaran/:id",editIdPengeluaran)

export default pengeluaranRouter