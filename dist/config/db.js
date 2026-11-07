"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/navasealstore';
    try {
        mongoose_1.default.set('strictQuery', false);
        const conn = await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`[Database] MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    }
    catch (error) {
        console.warn(`[Database Warning] Could not connect to MongoDB at ${mongoURI}: ${error.message}`);
        console.warn(`[Database Warning] The application will continue running. Please set MONGODB_URI in .env for persistent storage.`);
    }
};
exports.connectDB = connectDB;
