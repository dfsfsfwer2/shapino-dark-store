import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: 'دیجیتال', slug: 'digital' },
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

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug)
    if (!categoryId) throw new Error(`Category not found: ${product.categorySlug}`)

    await prisma.product.upsert({
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
