import { Router, Request, Response } from 'express';
import { ErrorJsonResponse, SuccessJsonResponse } from '../utils/json_mes';

const userRouter = Router();

userRouter.get('/users', async (req: Request, res: Response) => {
    
})