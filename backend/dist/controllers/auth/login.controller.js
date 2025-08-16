"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = exports.loginBodySchema = void 0;
const z = __importStar(require("zod"));
const db_1 = require("../../db/db");
const json_mes_1 = require("../../utils/json_mes");
const user_service_1 = require("../../service/user.service");
const allowedFieldForRegister = ['id', 'email', 'password', 'username', 'profile_picture', 'role', 'name', 'address', 'hub_id', 'business_name', 'business_address'];
exports.loginBodySchema = z.object({
    email: z.string(),
    password: z.string()
}).strict();
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const session = await (0, db_1.signInUser)(email, password);
        if (!session) {
            return (0, json_mes_1.ErrorJsonResponse)(res, 401, 'Invalid credentials');
        }
        //add cookies :>
        res.cookie('access_token', session.access_token, {
            httpOnly: true,
            secure: process.env.PRODUCTION_SITE === 'true', // http or https
            path: '/',
        });
        //could be removed since not use, but might use later
        res.cookie('refresh_token', session.refresh_token, {
            httpOnly: true,
            secure: process.env.PRODUCTION_SITE === 'true', // http or https
            path: '/',
        });
        //get user through id
        const user = await user_service_1.UserService.getUserById(session.user.id);
        if (user === null) { //this mean the user is created in authen but not in the db table (!critical if happens)
            return (0, json_mes_1.ErrorJsonResponse)(res, 404, "Unknown user");
        }
        // Return success with tokens
        (0, json_mes_1.SuccessJsonResponse)(res, 200, {
            data: {
                // access_token: session.access_token,
                // refresh_token: session.refresh_token,
                user: user
            }
        });
    }
    catch (error) {
        (0, json_mes_1.ErrorJsonResponse)(res, 500, 'Internal server error');
    }
};
exports.loginController = loginController;
