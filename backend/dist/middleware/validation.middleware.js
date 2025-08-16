"use strict";
/* RMIT University Vietnam
# Course: COSC2769 - Full Stack Development
# Semester: 2025B
# Assessment: Assignment 02
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const json_mes_1 = require("../utils/json_mes");
const validationMiddleware = (schema, validationPart) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req[validationPart]); // req['body'] <=> req.body
        req[validationPart] = validatedData;
        next();
    }
    catch (err) {
        (0, json_mes_1.ErrorJsonResponse)(res, 400, err.message);
    }
};
exports.validationMiddleware = validationMiddleware;
