import { body, header, validationResult } from "express-validator";
import express, { Request, Response, NextFunction } from 'express';
import db from '../../models/index';
import { Op } from 'sequelize';
import response from '@utils/response';

export const loginRules = () => {
    return [
        body('p')
            .notEmpty()
            .withMessage("payload can't be empty"),
        body("iv")
            .notEmpty()
            .withMessage("iv can't be empty!")
            .isString()
            .withMessage("iv should be string")
    ];

};

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors: any = [];
    const errorWithParams: any = {};
    errors.array().forEach((err) => extractedErrors.push(err.msg));
    errors.array().forEach((err: any) => errorWithParams[err.path] = err.msg);
    return response.error(res, {
        statusCode: 422,
        message: extractedErrors[0],
        errors: errorWithParams
    });

};