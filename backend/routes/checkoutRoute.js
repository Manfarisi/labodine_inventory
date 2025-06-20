import express from 'express';
import {  daftarCheckout, hapusCheckout, tambahCheckout } from '../controllers/checkoutController.js';

const checkoutRouter = express.Router();

checkoutRouter.post('/checkout', tambahCheckout);
checkoutRouter.get('/daftarCheckout', daftarCheckout);
checkoutRouter.delete('/hapusCheckout/:id', hapusCheckout);


export default checkoutRouter;
