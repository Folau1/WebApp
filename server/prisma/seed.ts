import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await argon2.hash(process.env.ADMIN_PASSWORD || 'admin123');
  
  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin'
    }
  });

  console.log('Admin user created');

  // Create categories
  const bagsCategory = await prisma.category.upsert({
    where: { slug: 'bags' },
    update: {},
    create: {
      name: 'Сумки',
      slug: 'bags'
    }
  });

  const homeCategory = await prisma.category.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      name: 'Товары для дома',
      slug: 'home'
    }
  });

  const jewelryCategory = await prisma.category.upsert({
    where: { slug: 'jewelry' },
    update: {},
    create: {
      name: 'Украшения',
      slug: 'jewelry'
    }
  });

  console.log('Categories created');

  // Create products with media
  const products = [
    {
      title: 'Кожаная сумка-шоппер',
      slug: 'leather-shopper-bag',
      description: 'Стильная и вместительная сумка из натуральной кожи. Идеальна для повседневного использования.',
      price: 890000, // 8900 руб
      compareAt: 1200000, // 12000 руб
      categoryId: bagsCategory.id,
      media: [
        { kind: 'IMAGE' as const, url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', order: 0 },
        { kind: 'IMAGE' as const, url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', order: 1 }
      ]
    },
    {
      title: 'Мини-сумка через плечо',
      slug: 'mini-crossbody-bag',
      description: 'Компактная сумка на длинном ремешке. Отлично подходит для вечерних выходов.',
      price: 450000, // 4500 руб
      categoryId: bagsCategory.id,
      media: [
        { kind: 'IMAGE' as const, url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', order: 0 }
      ]
    },
    {
      title: 'Ароматическая свеча',
      slug: 'aromatic-candle',
      description: 'Натуральная соевая свеча с ароматом лаванды. Время горения 40 часов.',
      price: 120000, // 1200 руб
      categoryId: homeCategory.id,
      media: [
        { kind: 'IMAGE' as const, url: 'https://images.unsplash.com/photo-1602607222562-568be31c911b', order: 0 }
      ]
    },
    {
      title: 'Керамическая ваза',
      slug: 'ceramic-vase',
      description: 'Ручная работа. Минималистичный дизайн, идеально впишется в любой интерьер.',
      price: 250000, // 2500 руб
      compareAt: 350000, // 3500 руб
      categoryId: homeCategory.id,
      media: [
        { kind: 'IMAGE' as const, url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427', order: 0 }
      ]
    },
    {
      title: 'Серьги-кольца золотые',
      slug: 'gold-hoop-earrings',
      description: 'Классические серьги-кольца из золота 585 пробы. Диаметр 2 см.',
      price: 1500000, // 15000 руб
      categoryId: jewelryCategory.id,
      media: [
        { kind: 'IMAGE' as const, url: 'https://images.unsplash.com/photo-1588444568894-7cc9e6209d7b', order: 0 }
      ]
    },
    {
      title: 'Браслет с натуральными камнями',
      slug: 'natural-stone-bracelet',
      description: 'Браслет из натурального аметиста. Регулируемый размер.',
      price: 180000, // 1800 руб
      categoryId: jewelryCategory.id,
      media: [
        { kind: 'IMAGE' as const, url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401', order: 0 }
      ]
    }
  ];

  for (const productData of products) {
    const { media, ...product } = productData;
    
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        media: {
          create: media
        }
      }
    });
  }

  console.log('Products created');

  // Create discounts
  const percentDiscount = await prisma.discount.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: 10, // 10%
      active: true
    }
  });

  const fixedDiscount = await prisma.discount.upsert({
    where: { code: 'SAVE500' },
    update: {},
    create: {
      code: 'SAVE500',
      type: 'FIXED',
      value: 50000, // 500 руб
      active: true
    }
  });

  // Apply discount to jewelry category
  await prisma.discountOnCategory.upsert({
    where: {
      categoryId_discountId: {
        categoryId: jewelryCategory.id,
        discountId: percentDiscount.id
      }
    },
    update: {},
    create: {
      categoryId: jewelryCategory.id,
      discountId: percentDiscount.id
    }
  });

  console.log('Discounts created');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
