import { generateKHQRString, crc16 } from './src/utils/khqr';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

console.log('--- NAVASEALSTORE Automated Logic & KHQR Test Suite ---');

// 1. Test CRC16 Calculation
const testString = '00020101021229270017navaseal_store@aclb010e520459995303840540519.995802KH5914NAVASEAL STORE6010Phnom Penh62200109NV-1234560509TXN-1234566304';
const checksum = crc16(testString);
console.log('✓ CRC16 Checksum generated:', checksum);
if (!checksum || checksum.length !== 4) {
  throw new Error('CRC16 calculation failed');
}

// 2. Test Official Bakong KHQR Generation
const khqr = generateKHQRString({
  bakongAccountId: 'navaseal_store@aclb',
  merchantName: 'NAVASEAL STORE',
  merchantCity: 'Phnom Penh',
  amount: 25.00,
  currency: 'USD',
  orderNumber: 'NV-998877',
  transactionId: 'TXN-112233',
});

console.log('✓ Generated KHQR Raw String:', khqr.qrString);
console.log('✓ Generated MD5 Hash:', khqr.md5);

if (!khqr.qrString.startsWith('000201010212')) {
  throw new Error('KHQR format indicator invalid');
}
if (!khqr.md5 || khqr.md5.length !== 32) {
  throw new Error('MD5 hash generation invalid');
}

// 3. Test Password Hashing & JWT
const testPass = 'Admin@123456';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(testPass, salt);
const isMatch = bcrypt.compareSync(testPass, hash);
console.log('✓ Bcrypt password hashing & comparison verified:', isMatch);
if (!isMatch) throw new Error('Bcrypt hash mismatch');

const token = jwt.sign({ id: 'test_admin_id', role: 'admin' }, 'test_secret_key', { expiresIn: '1h' });
const decoded = jwt.verify(token, 'test_secret_key') as any;
console.log('✓ JWT Token signature & decoded payload:', decoded.role);
if (decoded.role !== 'admin') throw new Error('JWT verification failed');

console.log('--- All Automated Verification Tests Passed Successfully! ---');

