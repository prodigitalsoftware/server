import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  storeName: string;
  storeNameKh: string;
  storeLogo: string;
  contactEmail: string;
  contactPhone: string;
  telegramSupportUrl: string;
  storeAnnouncement: string;
  storeAnnouncementKh: string;
  currency: 'USD' | 'KHR';
  exchangeRateUSDToKHR: number;
  bakongAccountId: string;
  bakongMerchantName: string;
  bakongMerchantCity: string;
  isSandboxMode: boolean;
}

const SettingSchema = new Schema<ISetting>(
  {
    storeName: { type: String, default: 'NAVASEALSTORE' },
    storeNameKh: { type: String, default: 'ណាវ៉ាស៊ីលស្ត័រ' },
    storeLogo: { type: String, default: '/logo.svg' },
    contactEmail: { type: String, default: 'support@navaseal.site' },
    contactPhone: { type: String, default: '+855 12 345 678' },
    telegramSupportUrl: { type: String, default: 'https://t.me/navasealstore' },
    storeAnnouncement: { type: String, default: '🎉 Welcome to NAVASEALSTORE! Instant digital delivery 24/7 with Bakong KHQR.' },
    storeAnnouncementKh: { type: String, default: '🎉 សូមស្វាគមន៍មកកាន់ NAVASEALSTORE! ការទូទាត់ប្រាក់ភ្លាមៗតាម Bakong KHQR និងទទួលបានផលិតផលភ្លាមៗ ២៤/៧។' },
    currency: { type: String, default: 'USD' },
    exchangeRateUSDToKHR: { type: Number, default: 4100 },
    bakongAccountId: { type: String, default: 'navaseal_store@aclb' },
    bakongMerchantName: { type: String, default: 'NAVASEAL STORE' },
    bakongMerchantCity: { type: String, default: 'Phnom Penh' },
    isSandboxMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>('Setting', SettingSchema);

