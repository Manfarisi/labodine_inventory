import express from 'express'
import { getAbsenById, getAllAbsen, hapusAbsen, hapusAbsenByUserId, tambahAbsen, updateAbsen } from '../controllers/absenController.js';
// import protect  from '../middleware/auth.js';
// import  isAdmin  from '../middleware/adminAuth.js';

const absenRouter = express.Router()

absenRouter.post('/absen', tambahAbsen);
absenRouter.get('/absen', getAllAbsen);
absenRouter.get('/absen/:id', getAbsenById);
absenRouter.put('/absen/:id',  updateAbsen);
absenRouter.delete('/absen/:id', hapusAbsen);
absenRouter.delete('/absen/user/:username',   hapusAbsenByUserId);



export default absenRouter