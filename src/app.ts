import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import routes from './routes';
import { seedDatabase } from './utils/seed';
import { Product } from './models/Product';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

// Socket.IO for live order and payment status updates
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });
});

// Security & utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allows images from uploads to be served
  })
);

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (generous for standard e-commerce flow)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Serve uploads
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Mount API routes
app.use('/api', routes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'NAVASEALSTORE',
    timestamp: new Date(),
    bakongConfigured: !!process.env.BAKONG_TOKEN,
  });
});

// Central error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
    await connectDB();

    // Auto-seed if database is empty
    try {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('[Init] No products found. Initializing seed data...');
        await seedDatabase();
      }
    } catch (e: any) {
      console.log('[Init note]: Product count check/seed skipped or pending:', e.message);
    }

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 NAVASEALSTORE Backend API running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🛍️  Cambodian Digital Products Marketplace`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

export { app, server, io };

