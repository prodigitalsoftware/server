"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const User_1 = require("../models/User");
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const Setting_1 = require("../models/Setting");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const sampleCategories = [
    {
        name: 'AI Tools & Software',
        nameKh: 'ឧបករណ៍ និងកម្មវិធី AI',
        slug: 'ai-tools-software',
        description: 'Cutting-edge AI applications, video generators, and digital workflow tools.',
        icon: 'Cpu',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
        name: 'Digital Courses',
        nameKh: 'វគ្គសិក្សាឌីជីថល',
        slug: 'digital-courses',
        description: 'Learn modern storytelling, AI monetization, video editing, and digital marketing.',
        icon: 'GraduationCap',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    },
    {
        name: 'TikTok Accounts',
        nameKh: 'គណនី TikTok',
        slug: 'tiktok-accounts',
        description: 'Monetization-ready TikTok accounts with USA/UK location setup and followers.',
        icon: 'Smartphone',
        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=600&q=80',
    },
    {
        name: 'AI Prompts',
        nameKh: 'កម្រង Prompts AI',
        slug: 'ai-prompts',
        description: 'Curated high-converting Midjourney, ChatGPT, and Claude prompts for business.',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    },
    {
        name: 'Digital Books',
        nameKh: 'សៀវភៅឌីជីថល (E-books)',
        slug: 'digital-books',
        description: 'In-depth e-books and master guides for personal growth, tech, and marketing.',
        icon: 'BookOpen',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    },
    {
        name: 'Web & System Development',
        nameKh: 'សេវាកម្មបង្កើតគេហទំព័រ និងប្រព័ន្ធ',
        slug: 'web-system-dev',
        description: 'Custom e-commerce platforms, web apps, Telegram bots, and automated systems.',
        icon: 'Code',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    },
];
const seedDatabase = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/navasealstore';
    try {
        await mongoose_1.default.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
        console.log('[Seed] Connected to database');
        // 1. Seed Settings
        await Setting_1.Setting.deleteMany({});
        await Setting_1.Setting.create({
            storeName: 'NAVASEALSTORE',
            storeNameKh: 'ណាវ៉ាស៊ីលស្ត័រ',
            storeLogo: '/logo.svg',
            contactEmail: 'support@navaseal.site',
            contactPhone: '+855 96 888 9922',
            telegramSupportUrl: 'https://t.me/navasealstore',
            storeAnnouncement: '🔥 Welcome to NAVASEALSTORE! Instant digital delivery & 100% verified Bakong KHQR checkout.',
            storeAnnouncementKh: '🔥 សូមស្វាគមន៍មកកាន់ NAVASEALSTORE! ការទូទាត់ប្រាក់ភ្លាមៗតាម Bakong KHQR និងទទួលបានផលិតផលភ្លាមៗ។',
            currency: 'USD',
            exchangeRateUSDToKHR: 4100,
            bakongAccountId: 'navaseal_store@aclb',
            bakongMerchantName: 'NAVASEAL STORE',
            bakongMerchantCity: 'Phnom Penh',
            isSandboxMode: true,
        });
        console.log('[Seed] Store settings created');
        // 2. Seed Users
        await User_1.User.deleteMany({});
        const salt = await bcryptjs_1.default.genSalt(10);
        const adminPassword = await bcryptjs_1.default.hash('Admin@123456', salt);
        const customerPassword = await bcryptjs_1.default.hash('Customer@123456', salt);
        const admin = await User_1.User.create({
            name: 'Navaseal Admin',
            email: 'admin@navaseal.site',
            passwordHash: adminPassword,
            phone: '+855 12 345 678',
            role: 'admin',
            status: 'active',
        });
        const customer = await User_1.User.create({
            name: 'Sophea Sok',
            email: 'customer@navaseal.site',
            passwordHash: customerPassword,
            phone: '+855 98 765 432',
            role: 'customer',
            status: 'active',
        });
        console.log('[Seed] Admin and Customer users seeded');
        // 3. Seed Categories
        await Category_1.Category.deleteMany({});
        const createdCategories = await Category_1.Category.insertMany(sampleCategories);
        console.log(`[Seed] Seeded ${createdCategories.length} categories`);
        const catMap = new Map();
        createdCategories.forEach((c) => catMap.set(c.slug, c._id));
        // 4. Seed Products
        await Product_1.Product.deleteMany({});
        const sampleProducts = [
            {
                name: 'AI Video Story Studio',
                nameKh: 'កម្មវិធីបង្កើតវីដេអូរឿង AI (AI Video Story Studio)',
                slug: 'ai-video-story-studio',
                description: 'Comprehensive automated AI software for creating engaging historical, fantasy, and fiction story videos for TikTok, YouTube Shorts, and Reels with natural voiceovers and automated captions.',
                descriptionKh: 'កម្មវិធី AI ស្វ័យប្រវត្តិកម្រិតខ្ពស់សម្រាប់ផលិតវីដេអូរឿងនិទាន ប្រវត្តិសាស្ត្រ និងភាពយន្តខ្លីសម្រាប់បង្ហោះលើ TikTok, YouTube Shorts និង Facebook Reels ដោយស្វ័យប្រវត្តិ។',
                price: 39.00,
                discountPrice: 19.99,
                category: catMap.get('ai-tools-software'),
                type: 'software',
                images: [
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://storage.googleapis.com/navaseal-downloads/ai-video-story-studio-v2.zip',
                digitalAccessInfo: 'Activation License Key: NAVA-AISTUDIO-9988-X72. Included setup instructions in English and Khmer.',
                stock: 500,
                featured: true,
                status: 'published',
                rating: 4.9,
                numReviews: 48,
                specifications: [
                    { key: 'Platform', value: 'Windows 10/11, macOS' },
                    { key: 'License', value: 'Lifetime Single Device' },
                    { key: 'Export Quality', value: '4K Ultra HD & Vertical 1080p' },
                    { key: 'Languages', value: 'Khmer, English, Chinese, Thai Voiceovers' },
                ],
                tags: ['AI Video', 'Shorts', 'TikTok', 'Storytelling', 'Software'],
            },
            {
                name: 'AI Storytelling Masterclass Course',
                nameKh: 'វគ្គសិក្សាមេបច្ចេកវិទ្យានិពន្ធរឿងជាមួយ AI',
                slug: 'ai-storytelling-course',
                description: 'From zero to monetized viral creator. Learn how to write high-retention viral storytelling scripts using ChatGPT-4o, generate cinematic visuals with Midjourney v6, and monetize on Facebook & YouTube.',
                descriptionKh: 'វគ្គសិក្សាពេញលេញបង្រៀនពីរបៀបសរសេររឿង viral ដោយប្រើប្រាស់ ChatGPT-4o, បង្កើតរូបភាពភាពយន្តជាមួយ Midjourney v6 និងរបៀបរកប្រាក់ពី Reels & YouTube។',
                price: 55.00,
                discountPrice: 25.00,
                category: catMap.get('digital-courses'),
                type: 'course',
                images: [
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://courses.navaseal.site/enrol/ai-storytelling-course',
                digitalAccessInfo: 'Access portal: https://courses.navaseal.site. Lifetime private Telegram VIP student group access included.',
                stock: 999,
                featured: true,
                status: 'published',
                rating: 5.0,
                numReviews: 64,
                specifications: [
                    { key: 'Total Modules', value: '18 High-Definition Video Lessons' },
                    { key: 'Language', value: 'Khmer & English Subtitles' },
                    { key: 'Resource Files', value: '50+ Ready-to-use Prompt Templates' },
                    { key: 'Support', value: 'Direct Mentorship on Telegram' },
                ],
                tags: ['Course', 'Storytelling', 'Midjourney', 'ChatGPT', 'Monetization'],
            },
            {
                name: 'TikTok USA Monetized Account (10K+ Followers)',
                nameKh: 'គណនី TikTok USA បើកការរកលុយ (10K+ Followers)',
                slug: 'tiktok-usa-account',
                description: 'Pre-warmed, 100% organic USA TikTok account with Creativity Program Beta unlocked (10,000+ real followers). Ready to earn ad revenue immediately from video views.',
                descriptionKh: 'គណនី TikTok សហរដ្ឋអាមេរិក 100% Organic ដែលមាន Follower លើសពី 10,000 នាក់ និងបានបើកប្រព័ន្ធរកប្រាក់ Creativity Program Beta រួចជាស្រេច។',
                price: 120.00,
                discountPrice: 79.00,
                category: catMap.get('tiktok-accounts'),
                type: 'account',
                images: [
                    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://drive.google.com/drive/navaseal-tiktok-accounts',
                digitalAccessInfo: 'Full original email + TikTok login credentials + USA recovery email transferred immediately after payment.',
                stock: 12,
                featured: true,
                status: 'published',
                rating: 4.8,
                numReviews: 29,
                specifications: [
                    { key: 'Followers', value: '10,200+ Genuine Followers' },
                    { key: 'Region', value: 'United States (Eligible for Beta)' },
                    { key: 'Email', value: 'Original Clean Gmail Included' },
                    { key: 'Safety Guarantee', value: '7 Days Replacement Guarantee' },
                ],
                tags: ['TikTok USA', 'Account', 'Monetization', 'Social Media'],
            },
            {
                name: 'Ultimate AI Prompt Collection (5,000+ Prompts)',
                nameKh: 'កម្រង Prompts AI ពិសេសជាង 5,000 Prompts សម្រាប់អាជីវកម្ម',
                slug: 'ai-prompt-collection',
                description: 'Massive library of tested, high-yield prompts for ChatGPT, Claude 3.5 Sonnet, and Midjourney v6. Includes sales funnels, SEO copywriting, graphic design, and coding templates.',
                descriptionKh: 'បណ្តុំ Prompts ពិសេសជាង 5,000 សម្រាប់ ChatGPT, Claude និង Midjourney v6 ជួយជំរុញការលក់ សរសេរមាតិកា និងរចនារូបភាពអាជីព។',
                price: 29.00,
                discountPrice: 9.99,
                category: catMap.get('ai-prompts'),
                type: 'prompt',
                images: [
                    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://notion.so/navaseal/Ultimate-AI-Prompt-Collection-Master-Database',
                digitalAccessInfo: 'Duplicate Notion Template Link + Searchable PDF & Excel sheets provided in your customer library.',
                stock: 9999,
                featured: false,
                status: 'published',
                rating: 5.0,
                numReviews: 87,
                specifications: [
                    { key: 'Format', value: 'Notion Workspace + CSV + PDF' },
                    { key: 'Total Prompts', value: '5,400+ Categorized Prompts' },
                    { key: 'Updates', value: 'Free Monthly Lifetime Updates' },
                    { key: 'Categories', value: 'Marketing, E-commerce, Coding, Art' },
                ],
                tags: ['Prompts', 'ChatGPT', 'Midjourney', 'Copywriting'],
            },
            {
                name: 'Digital Book Master Collection (100+ Best Sellers)',
                nameKh: 'កម្រងសៀវភៅឌីជីថល Best-Seller ជាង ១០០ ក្បាល',
                slug: 'digital-book-collection',
                description: 'Hand-picked digital books in business strategy, financial freedom, psychological persuasion, and artificial intelligence in EPUB & PDF formats.',
                descriptionKh: 'សៀវភៅឌីជីថលល្បីៗលើពិភពលោកជាង ១០០ ក្បាល ស្តីពីភាពជាអ្នកដឹកនាំ ហិរញ្ញវត្ថុ ការលក់ និងបច្ចេកវិទ្យា AI (ជា PDF & EPUB)។',
                price: 35.00,
                discountPrice: 14.50,
                category: catMap.get('digital-books'),
                type: 'ebook',
                images: [
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://cloud.navaseal.site/books/all-master-collection.zip',
                digitalAccessInfo: 'Direct cloud download link with 100+ organized PDF/EPUB books with high resolution typography.',
                stock: 999,
                featured: false,
                status: 'published',
                rating: 4.9,
                numReviews: 32,
                specifications: [
                    { key: 'Format', value: 'PDF & EPUB (Kindle & iPad compatible)' },
                    { key: 'Count', value: '112 Complete E-books' },
                    { key: 'File Size', value: '1.4 GB Compressed Archive' },
                    { key: 'Language', value: 'English & Khmer Summaries' },
                ],
                tags: ['E-books', 'Business', 'Self-improvement', 'Digital Books'],
            },
            {
                name: 'AI Video Downloader & Bulk Watermark Remover',
                nameKh: 'កម្មវិធីទាញយក និងលុប Watermark វីដេអូរាប់ពាន់ដោយស្វ័យប្រវត្តិ',
                slug: 'ai-video-downloader',
                description: 'Lightning-fast bulk video downloader for TikTok, Douyin, Kuaishou, Instagram, and YouTube. Automatically extracts HD videos without watermarks in seconds.',
                descriptionKh: 'កម្មវិធីទាញយកវីដេអូកម្រិត HD ដោយគ្មានជាប់ Watermark ពី TikTok, Douyin, Facebook និង Instagram យ៉ាងរហ័សទាន់ចិត្ត។',
                price: 25.00,
                discountPrice: 12.00,
                category: catMap.get('ai-tools-software'),
                type: 'software',
                images: [
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://software.navaseal.site/dl/navaseal-videosaver-v3.exe',
                digitalAccessInfo: 'Includes standalone Windows EXE + macOS installer + VIP key for unlimited batch downloads.',
                stock: 350,
                featured: true,
                status: 'published',
                rating: 4.8,
                numReviews: 41,
                specifications: [
                    { key: 'Speed', value: 'Multi-threaded high-speed download' },
                    { key: 'Batch Mode', value: 'Download entire creator profile at once' },
                    { key: 'Watermark', value: '100% Clean original quality' },
                    { key: 'Updates', value: 'Auto-updates when platforms change algorithms' },
                ],
                tags: ['Video Downloader', 'TikTok Tool', 'No Watermark', 'Software'],
            },
            {
                name: 'Custom Website & E-commerce System Development',
                nameKh: 'សេវាកម្មរចនា និងបង្កើតវេបសាយពាណិជ្ជកម្មពេញលេញ',
                slug: 'website-development-service',
                description: 'Complete full-stack development service tailored for your business in Cambodia. Includes responsive UI/UX, KHQR payment gateway, admin portal, and cloud hosting setup.',
                descriptionKh: 'សេវាកម្មរចនា និងបង្កើតគេហទំព័រលក់ទំនិញពេញលេញ មានភ្ជាប់ប្រព័ន្ធបង់ប្រាក់ KHQR Bakong, ផ្ទាំងគ្រប់គ្រង Admin និងការរៀបចំ Hosting។',
                price: 350.00,
                discountPrice: 280.00,
                category: catMap.get('web-system-dev'),
                type: 'service',
                images: [
                    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://navaseal.site/client-portal/onboarding',
                digitalAccessInfo: 'Dedicated Project Manager consultation link + source code repository access + Figma designs.',
                stock: 10,
                featured: true,
                status: 'published',
                rating: 5.0,
                numReviews: 19,
                specifications: [
                    { key: 'Timeline', value: '7-14 Business Days' },
                    { key: 'Technologies', value: 'React, Node.js, MongoDB / PostgreSQL' },
                    { key: 'Payment Gateways', value: 'Bakong KHQR, ABA PayWay, Stripe' },
                    { key: 'Maintenance', value: '3 Months Free Technical Support' },
                ],
                tags: ['Web Development', 'Full-Stack', 'E-commerce', 'KHQR Integration'],
            },
            {
                name: 'Ticket & Event Management System (Full Source Code)',
                nameKh: 'ប្រព័ន្ធគ្រប់គ្រងការលក់សំបុត្រ និងព្រឹត្តិការណ៍ (Source Code ពេញលេញ)',
                slug: 'ticket-management-system',
                description: 'Turnkey event ticketing platform source code with QR code ticket generation, attendee scanner mobile app, live sales analytics, and Bakong KHQR instant payment checkout.',
                descriptionKh: 'Source code ប្រព័ន្ធលក់សំបុត្រព្រឹត្តិការណ៍ពេញលេញ មាន QR code check-in, App ស្កេនសំបុត្រ និងភ្ជាប់ KHQR រួចជាស្រេច។',
                price: 180.00,
                discountPrice: 99.00,
                category: catMap.get('web-system-dev'),
                type: 'software',
                images: [
                    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
                ],
                digitalDownloadUrl: 'https://github.com/navaseal-enterprise/ticket-manager-release.zip',
                digitalAccessInfo: 'Private GitHub repo invitation + Docker deployment compose file + Database migration scripts.',
                stock: 100,
                featured: false,
                status: 'published',
                rating: 4.9,
                numReviews: 24,
                specifications: [
                    { key: 'Stack', value: 'TypeScript, Next.js, Express, PostgreSQL' },
                    { key: 'Features', value: 'QR Code ticket generator, Live Scanner PWA' },
                    { key: 'Documentation', value: 'Complete PDF Developer Handbook' },
                    { key: 'Commercial License', value: 'Royalty-free multi-client usage' },
                ],
                tags: ['Source Code', 'Ticketing', 'Events', 'System Development'],
            },
        ];
        await Product_1.Product.insertMany(sampleProducts);
        console.log(`[Seed] Seeded ${sampleProducts.length} sample products with Khmer descriptions`);
        console.log('[Seed] Database successfully populated!');
        if (require.main === module) {
            process.exit(0);
        }
    }
    catch (error) {
        console.error('[Seed Error]:', error);
        if (require.main === module) {
            process.exit(1);
        }
    }
};
exports.seedDatabase = seedDatabase;
if (require.main === module) {
    (0, exports.seedDatabase)();
}
