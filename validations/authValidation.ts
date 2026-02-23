import Joi from "joi";

export const signupSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("buyer", "seller").default("buyer"),
  phone: Joi.string().allow("", null).optional(),
  gender: Joi.string().valid("male", "female", "other").allow(null).optional(),
  dateOfBirth: Joi.string().allow(null, "").optional(),
  // buyer only
  deliveryAddress: Joi.when("role", {
    is: "buyer",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("", null).optional(),
  }),
  // seller only
  storeName: Joi.when("role", {
    is: "seller",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("", null).optional(),
  }),
  businessAddress: Joi.when("role", {
    is: "seller",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("", null).optional(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
