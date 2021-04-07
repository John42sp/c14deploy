import 'reflect-metadata';
import './database';
import 'dotenv/config';
import express, {Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { router } from './routes';
import { AppError } from './errors/AppErrors';
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use(router);

app.use(
    (err: Error, request: Request, response: Response, _next: NextFunction ) => {
        if(err instanceof AppError) {
            return response.status(err.statusCode).json({
                message: err.message,
            })
        }    
        
        return response.status(500).json({
            status: "Error",
            message: `Internal server error ${err.message}`
        })
    }
)
const port = process.env.PORT || 3333;

app.listen(port, ()=> console.log(`Server is running on port ${port}!`));
