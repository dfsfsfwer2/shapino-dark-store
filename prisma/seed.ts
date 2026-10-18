import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: 'دیجیتال', slug: 'digital' },
  { name: 'گیمینگ', slug: 'gaming' },
  { name: 'تفریح و سرگرمی', slug: 'fun' },
  { name: 'لوازم جانبی', slug: 'accessories' },
  { name: 'مد و استایل', slug: 'fashion' },
  { name: 'خانه و آشپزخانه', slug: 'home' },
]

const products = [
  {
    name: 'هدفون بی‌سیم پرو مکس',
    slug: 'wireless-pro-max-headphones',
    description: 'صدای فراگیر، نویز کنسلینگ فعال و ۴۰ ساعت پخش موسیقی.',
    price: 8900000,
    comparePrice: 10500000,
    image: '/images/products/p1.png',
    stock: 12,
    rating: 4.8,
    featured: true,
    categorySlug: 'digital',
  },
  {
    name: 'ساعت هوشمند سری ۹',
    slug: 'smartwatch-series-9',
    description: 'نمایشگر همیشه روشن، پایش سلامت و ضربان قلب.',
    price: 12400000,
    comparePrice: 14900000,
    image: '/images/products/p2.png',
    stock: 8,
    rating: 4.7,
    featured: true,
    categorySlug: 'digital',
  },
  {
    name: 'کیبورد مکانیکال RGB',
    slug: 'mechanical-keyboard-rgb',
    description: 'سوییچ‌های مکانیکال قرمز، نورپردازی گرم و بدنه آلومینیومی.',
    price: 3250000,
    comparePrice: null,
    image: '/images/products/p3.png',
    stock: 20,
    rating: 4.6,
    featured: false,
    categorySlug: 'accessories',
  },
  {
    name: 'اسپیکر بلوتوث ساند‌ویو',
    slug: 'soundwave-speaker',
    description: 'صدای ۳۶۰ درجه، مقاوم در برابر آب و ۱۲ ساعت پخش.',
    price: 2780000,
    comparePrice: 3300000,
    image: '/images/products/p4.png',
    stock: 15,
    rating: 4.5,
    featured: true,
    categorySlug: 'accessories',
  },
  {
    name: 'عینک آفتابی آویاتور طلایی',
    slug: 'golden-aviator-sunglasses',
    description: 'فریم طلایی سبک و عدسی پلاریزه UV400.',
    price: 1850000,
    comparePrice: 2200000,
    image: '/images/products/p5.png',
    stock: 25,
    rating: 4.4,
    featured: false,
    categorySlug: 'fashion',
  },
  {
    name: 'کوله‌پشتی شهری ضدآب',
    slug: 'urban-waterproof-backpack',
    description: 'جیب لپ‌تاپ ۱۵ اینچ، پارچه ضدآب و طراحی ارگونومیک.',
    price: 2150000,
    comparePrice: null,
    image: '/images/products/p6.png',
    stock: 18,
    rating: 4.6,
    featured: false,
    categorySlug: 'fashion',
  },
  {
    name: 'چراغ مطالعه مینیمال',
    slug: 'minimal-desk-lamp',
    description: 'سه حالت نور گرم، بازوی قابل تنظیم و مصرف انرژی پایین.',
    price: 980000,
    comparePrice: 1200000,
    image: '/images/products/p7.png',
    stock: 30,
    rating: 4.3,
    featured: false,
    categorySlug: 'home',
  },
  {
    name: 'اسپرسوساز حرفه‌ای بارِستا',
    slug: 'baresta-espresso-machine',
    description: 'فشار ۱۵ بار، بخار حرفه‌ای و بدنه استیل ضدزنگ.',
    price: 15600000,
    comparePrice: 18200000,
    image: '/images/products/p8.png',
    stock: 6,
    rating: 4.9,
    featured: true,
    categorySlug: 'home',
  },

  /* ---------------- گیمینگ ---------------- */
  {
    name: 'هدست واقعیت مجازی ویژن پرو',
    slug: 'vr-vision-headset',
    description: 'دو نمایشگر 4K، ردیابی حرکات دست و بیش از ۵۰۰ بازی فراگیر. واقعیت مجازی را با تمام حس‌هایتان تجربه کنید!',
    price: 18500000,
    comparePrice: 22000000,
    image: '/images/products/p9.png',
    stock: 7,
    rating: 4.8,
    featured: true,
    categorySlug: 'gaming',
  },
  {
    name: 'دسته بازی حرفه‌ای نکسوس',
    slug: 'nexus-pro-controller',
    description: 'آنالوگ هال‌افکت بدون دریفت، تریگرهای قابل تنظیم و باتری ۳۰ ساعته. سازگار با PC و کنسول‌ها.',
    price: 2450000,
    comparePrice: 2900000,
    image: '/images/products/p10.png',
    stock: 25,
    rating: 4.7,
    featured: false,
    categorySlug: 'gaming',
  },
  {
    name: 'کنسول بازی رترو مینیمال',
    slug: 'retro-mini-console',
    description: 'بیش از ۶۰۰۰ بازی نوستالژی کلاسیک، دو دسته سیمی و خروجی HDMI. یک شب خاطره‌انگیز برای همه‌ی خانواده!',
    price: 3800000,
    comparePrice: null,
    image: '/images/products/p17.png',
    stock: 14,
    rating: 4.6,
    featured: true,
    categorySlug: 'gaming',
  },
  {
    name: 'ماوس گیمینگ بی‌سیم ولتیکس',
    slug: 'voltex-gaming-mouse',
    description: 'سنسور ۲۶ هزار DPI، وزن ۶۸ گرم و نورپردازی گرم. دقیق‌ترین شات عمرت را بزن!',
    price: 1650000,
    comparePrice: 1990000,
    image: '/images/products/p18.png',
    stock: 32,
    rating: 4.6,
    featured: false,
    categorySlug: 'gaming',
  },

  /* ---------------- تفریح و سرگرمی ---------------- */
  {
    name: 'پهپاد تصویربرداری اسکای‌آی ۴K',
    slug: 'skyeye-4k-drone',
    description: 'دوربین ۴K با ژیمبال سه‌محوره، ۳۵ دقیقه پرواز و بازگشت هوشمند. آسمان‌ها مال توست!',
    price: 12800000,
    comparePrice: 15500000,
    image: '/images/products/p11.png',
    stock: 9,
    rating: 4.9,
    featured: true,
    categorySlug: 'fun',
  },
  {
    name: 'ماشین کنترلی آفرود راکتی',
    slug: 'rocket-rc-buggy',
    description: 'سرعت ۴۰ کیلومتر بر ساعت، شاسی ضدضربه و باتری قابل تعویض. هیجان را برای بچه‌ها دوبرابر کن!',
    price: 3200000,
    comparePrice: 3850000,
    image: '/images/products/p12.png',
    stock: 21,
    rating: 4.5,
    featured: false,
    categorySlug: 'fun',
  },
  {
    name: 'اسکوتر برقی تاشو زِفیر',
    slug: 'zephyr-e-scooter',
    description: 'برد ۴۵ کیلومتر، سرعت ۳۲ کیلومتر بر ساعت و طراحی تاشو. شهر را با استایل بپیمای!',
    price: 24900000,
    comparePrice: 28500000,
    image: '/images/products/p13.png',
    stock: 5,
    rating: 4.8,
    featured: true,
    categorySlug: 'fun',
  },
  {
    name: 'هاوربورد الکتریکی گلاید',
    slug: 'glide-hoverboard',
    description: 'چرخ‌های نورانی LED، بلندگوهای داخلی و تعادل خودکار. سواری روی ابر!',
    price: 9800000,
    comparePrice: 11500000,
    image: '/images/products/p14.png',
    stock: 11,
    rating: 4.4,
    featured: false,
    categorySlug: 'fun',
  },
  {
    name: 'میکروفون کالسکه بی‌سیم پاپ‌استار',
    slug: 'popstar-karaoke-mic',
    description: 'بلندگوی داخلی، افکت صوتی جادویی و اتصال بلوتوث. پارتی هر جا که تو باشی!',
    price: 1950000,
    comparePrice: 2400000,
    image: '/images/products/p15.png',
    stock: 28,
    rating: 4.3,
    featured: false,
    categorySlug: 'fun',
  },
  {
    name: 'نورپردازی لیزری پارتی پالس',
    slug: 'pulse-party-laser',
    description: '۱۶ حالت نور لیزری و هالوگرافیک، همگام با موسیقی. جشن خانه‌ات را حرفه‌ای کن!',
    price: 2400000,
    comparePrice: 2900000,
    image: '/images/products/p16.png',
    stock: 19,
    rating: 4.5,
    featured: false,
    categorySlug: 'fun',
  },
  {
    name: 'ربات هوشمند اکتو',
    slug: 'octo-smart-robot',
    description: 'ربات برنامه‌ریزی‌پذیر با تشخیص صدا، رقص و بازی تعاملی. بهترین همراه آموزشی بچه‌ها!',
    price: 4900000,
    comparePrice: 5600000,
    image: '/images/products/p19.png',
    stock: 13,
    rating: 4.7,
    featured: false,
    categorySlug: 'fun',
  },
  {
    name: 'اسکیت‌برد برقی وُلت',
    slug: 'volt-e-skateboard',
    description: 'موتور دوگانه، برد ۳۰ کیلومتر و ریموت بی‌سیم. خیابان‌ها پیست تو هستند!',
    price: 16500000,
    comparePrice: 19000000,
    image: '/images/products/p20.png',
    stock: 6,
    rating: 4.8,
    featured: true,
    categorySlug: 'fun',
  },
]

/* سفارش‌های نمونه برای داشبورد — فقط وقتی هیچ سفارشی وجود ندارد ساخته می‌شوند */
const demoOrders: Array<{
  customerName: string
  phone: string
  address: string
  daysAgo: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{ slug: string; qty: number }>
}> = [
  {
    customerName: 'امیرحسین کاظمی', phone: '09121112233', address: 'تهران، سعادت‌آباد، بلوار دریا، پلاک ۷۸',
    daysAgo: 6, status: 'delivered',
    items: [{ slug: 'skyeye-4k-drone', qty: 1 }, { slug: 'popstar-karaoke-mic', qty: 1 }],
  },
  {
    customerName: 'نگار موسوی', phone: '09354445566', address: 'شیراز، بلوار زند، کوچه ۱۲، پلاک ۳۴',
    daysAgo: 5, status: 'delivered',
    items: [{ slug: 'retro-mini-console', qty: 1 }, { slug: 'nexus-pro-controller', qty: 2 }],
  },
  {
    customerName: 'رضا شریفی', phone: '09197778899', address: 'مشهد، بلوار وکیل‌آباد، پلاک ۲۱۰',
    daysAgo: 4, status: 'delivered',
    items: [{ slug: 'glide-hoverboard', qty: 1 }],
  },
  {
    customerName: 'مریم رستمی', phone: '09012223344', address: 'تبریز، خیابان آزادی، پلاک ۱۵',
    daysAgo: 3, status: 'shipped',
    items: [{ slug: 'volt-e-skateboard', qty: 1 }, { slug: 'voltex-gaming-mouse', qty: 1 }],
  },
  {
    customerName: 'حسین قاسمی', phone: '09365556677', address: 'اصفهان، خیابان سجاد، پلاک ۵۵',
    daysAgo: 3, status: 'processing',
    items: [{ slug: 'vr-vision-headset', qty: 1 }],
  },
  {
    customerName: 'الهام نوری', phone: '09128889900', address: 'کرج، عظیمیه، میدان اسبی، پلاک ۹',
    daysAgo: 2, status: 'shipped',
    items: [{ slug: 'rocket-rc-buggy', qty: 2 }, { slug: 'pulse-party-laser', qty: 1 }],
  },
  {
    customerName: 'سینا ملکی', phone: '09337778811', address: 'رشت، گلسار، بلوار نماز، پلاک ۴۳',
    daysAgo: 1, status: 'processing',
    items: [{ slug: 'zephyr-e-scooter', qty: 1 }],
  },
  {
    customerName: 'پریسا احمدی', phone: '09105554433', address: 'یزد، خیابان دهم فروردین، پلاک ۶۷',
    daysAgo: 0, status: 'pending',
    items: [{ slug: 'octo-smart-robot', qty: 1 }, { slug: 'popstar-karaoke-mic', qty: 2 }],
  },
  {
    customerName: 'بهنام صادقی', phone: '09141119988', address: 'اهواز، کیانپارس، خیابان ۹ شرقی، پلاک ۱۲',
    daysAgo: 0, status: 'cancelled',
    items: [{ slug: 'golden-aviator-sunglasses', qty: 1 }],
  },
]

async function main() {
  const categoryMap = new Map<string, number>()

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    })
    categoryMap.set(category.slug, record.id)
  }

  const productMap = new Map<string, { id: number; price: number; name: string }>()

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug)
    if (!categoryId) throw new Error(`Category not found: ${product.categorySlug}`)

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.image,
        stock: product.stock,
        rating: product.rating,
        featured: product.featured,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.image,
        stock: product.stock,
        rating: product.rating,
        featured: product.featured,
        categoryId,
      },
    })
    productMap.set(product.slug, { id: record.id, price: product.price, name: product.name })
  }

  // سفارش‌های نمونه — فقط اگر دیتابیس سفارشی ندارد (idempotent)
  const ordersCount = await prisma.order.count()
  if (ordersCount === 0) {
    for (const demo of demoOrders) {
      const total = demo.items.reduce(
        (sum, item) => sum + (productMap.get(item.slug)?.price ?? 0) * item.qty,
        0
      )
      const createdAt = new Date(Date.now() - demo.daysAgo * 24 * 60 * 60 * 1000 - Math.floor(Math.random() * 8) * 60 * 60 * 1000)

      await prisma.order.create({
        data: {
          customerName: demo.customerName,
          phone: demo.phone,
          address: demo.address,
          total,
          status: demo.status,
          createdAt,
          items: {
            create: demo.items.map((item) => {
              const p = productMap.get(item.slug)!
              return { productId: p.id, productName: p.name, price: p.price, quantity: item.qty }
            }),
          },
        },
      })
    }
    console.log(`Demo orders created: ${demoOrders.length}`)
  }

  console.log(`Seed complete: ${categories.length} categories, ${products.length} products.`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
