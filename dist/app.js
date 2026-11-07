"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
const seed_1 = require("./utils/seed");
const Product_1 = require("./models/Product");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Socket.IO for live order and payment status updates
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
app.set('io', io);
io.on('connection', (socket) => {
    socket.on('join_order', (orderId) => {
        socket.join(`order_${orderId}`);
    });
});
// Security & utility middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false, // allows images from uploads to be served
}));
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting (generous for standard e-commerce flow)
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);
// Serve uploads
const uploadsDir = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsDir));
// Mount API routes
app.use('/api', routes_1.default);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        store: 'NAVASEALSTORE',
        timestamp: new Date(),
        bakongConfigured: !!process.env.BAKONG_TOKEN,
    });
});
// Central error handling middleware
app.use((err, _req, res, _next) => {
    console.error('[Server Error]:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
const PORT = process.env.PORT || 5000;
// Initialize Database and start server
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        // Auto-seed if database is empty
        try {
            const productCount = await Product_1.Product.countDocuments();
            if (productCount === 0) {
                console.log('[Init] No products found. Initializing seed data...');
                await (0, seed_1.seedDatabase)();
            }
        }
        catch (e) {
            console.log('[Init note]: Product count check/seed skipped or pending:', e.message);
        }
        server.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(`🚀 NAVASEALSTORE Backend API running on port ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🛍️  Cambodian Digital Products Marketplace`);
            console.log(`====================================================`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
    }
};
startServer();
