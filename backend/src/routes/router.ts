/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

//place to hold all routers


import { Router } from 'express';
import authRouter from './auth.router';
import UserRouter from './user.router';
import CustomerRouter from './customer.router'
import ProductRouter from './products.router';
import { requireAuth } from '../middleware/requireAuth';
import DistributionHubRouter from './distribution_hubs.router';
import OrderRouter from './orders.router';
import ShoppingCartRouter from './shopping_cart_items.router';
import VendorRouter from './vendor.router';
import ShipperRouter from './shipper.router';
const apiRouter = Router();

apiRouter.use("/auth", authRouter);

apiRouter.use("/users", requireAuth(), UserRouter);

apiRouter.use('/customers', requireAuth(), CustomerRouter);

apiRouter.use('/vendors', requireAuth(), VendorRouter)

apiRouter.use('shippers', requireAuth(), ShipperRouter)

apiRouter.use("/products", requireAuth("customer"), ProductRouter);

apiRouter.use("/distribution-hubs", requireAuth(), DistributionHubRouter);

apiRouter.use("/orders", requireAuth("shipper"), OrderRouter);

apiRouter.use("/cart", requireAuth("customer"), ShoppingCartRouter);
export default apiRouter;
