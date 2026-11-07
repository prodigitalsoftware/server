"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crc16 = crc16;
exports.formatTLV = formatTLV;
exports.generateKHQRString = generateKHQRString;
exports.generateQRCodeDataURL = generateQRCodeDataURL;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Calculate CRC16 CCITT-FALSE (EMVCo specification standard)
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
function crc16(data) {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
        const code = data.charCodeAt(i);
        crc ^= code << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xffff;
            }
            else {
                crc = (crc << 1) & 0xffff;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}
/**
 * Format EMVCo TLV (Tag-Length-Value)
 */
function formatTLV(tag, value) {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
}
/**
 * Generate official EMVCo compliant Bakong KHQR String
 */
function generateKHQRString(options) {
    const { bakongAccountId, merchantName, merchantCity = 'Phnom Penh', amount, currency, orderNumber, transactionId, } = options;
    // Tag 00: Payload Format Indicator (01)
    const tag00 = formatTLV('00', '01');
    // Tag 01: Point of Initiation Method: 12 (Dynamic QR)
    const tag01 = formatTLV('01', '12');
    // Tag 29: Merchant Account Information
    // Subtag 00: Global Unique Identifier
    const sub00 = formatTLV('00', bakongAccountId);
    // Subtag 01: Merchant ID
    const sub01 = formatTLV('01', bakongAccountId.includes('@') ? bakongAccountId.split('@')[0] : bakongAccountId);
    const tag29 = formatTLV('29', `${sub00}${sub01}`);
    // Tag 52: Merchant Category Code (0000 or 5999)
    const tag52 = formatTLV('52', '5999');
    // Tag 53: Transaction Currency (840 = USD, 116 = KHR)
    const currencyCode = currency === 'KHR' ? '116' : '840';
    const tag53 = formatTLV('53', currencyCode);
    // Tag 54: Transaction Amount
    const formattedAmount = currency === 'KHR' ? Math.round(amount).toString() : amount.toFixed(2);
    const tag54 = formatTLV('54', formattedAmount);
    // Tag 58: Country Code (KH)
    const tag58 = formatTLV('58', 'KH');
    // Tag 59: Merchant Name
    const cleanMerchantName = merchantName.slice(0, 25);
    const tag59 = formatTLV('59', cleanMerchantName);
    // Tag 60: Merchant City
    const cleanCity = merchantCity.slice(0, 15);
    const tag60 = formatTLV('60', cleanCity);
    // Tag 62: Additional Data Field Template
    const sub62_01 = formatTLV('01', orderNumber.slice(0, 25));
    const sub62_05 = formatTLV('05', transactionId.slice(0, 25));
    const tag62 = formatTLV('62', `${sub62_01}${sub62_05}`);
    // Base payload without CRC
    const rawPayloadWithoutCRC = `${tag00}${tag01}${tag29}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;
    const checksum = crc16(rawPayloadWithoutCRC);
    const qrString = `${rawPayloadWithoutCRC}${checksum}`;
    // Bakong uses MD5 of the generated KHQR string for verification
    const md5 = crypto_1.default.createHash('md5').update(qrString).digest('hex');
    return { qrString, md5 };
}
/**
 * Generate QR code as Base64 Data URL with styling suitable for KHQR
 */
async function generateQRCodeDataURL(qrString) {
    return await qrcode_1.default.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
        width: 320,
    });
}
