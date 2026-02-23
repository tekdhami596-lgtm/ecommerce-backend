import Joi from "joi";
import { NextFunction, Request, Response } from "express";


export const validate = (schema:Joi.ObjectSchema) => {
  return (req:Request, res:Response, next:NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details?.[0]?.message,
      });
    }

    req.body = value;

    next();
  };
};
