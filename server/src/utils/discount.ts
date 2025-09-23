interface ProductWithDiscounts {
  price: number;
  compareAt: number | null;
  discounts: Array<{
    discount: {
      type: 'PERCENT' | 'FIXED';
      value: number;
    };
  }>;
}

export interface DiscountResult {
  finalPrice: number;
  discount: {
    amount: number;
    percentage: number;
  } | null;
}

export function calculateDiscountPrice(product: ProductWithDiscounts): DiscountResult {
  let finalPrice = product.price;
  let discountAmount = 0;

  // First check if product has compare at price (manual discount)
  if (product.compareAt && product.compareAt > product.price) {
    discountAmount = product.compareAt - product.price;
  }

  // Then apply automatic discounts
  if (product.discounts.length > 0) {
    // Find the best discount
    let bestDiscount = 0;

    for (const { discount } of product.discounts) {
      let currentDiscount = 0;

      if (discount.type === 'PERCENT') {
        currentDiscount = Math.floor(product.price * discount.value / 100);
      } else {
        currentDiscount = discount.value;
      }

      if (currentDiscount > bestDiscount) {
        bestDiscount = currentDiscount;
      }
    }

    if (bestDiscount > discountAmount) {
      discountAmount = bestDiscount;
    }
  }

  finalPrice = Math.max(0, product.price - discountAmount);

  if (discountAmount > 0) {
    const percentage = Math.round((discountAmount / product.price) * 100);
    return {
      finalPrice,
      discount: {
        amount: discountAmount,
        percentage
      }
    };
  }

  return {
    finalPrice: product.price,
    discount: null
  };
}

export function calculateOrderDiscount(
  subtotal: number,
  discount: { type: 'PERCENT' | 'FIXED'; value: number } | null
): number {
  if (!discount) return 0;

  if (discount.type === 'PERCENT') {
    return Math.floor(subtotal * discount.value / 100);
  }

  return Math.min(discount.value, subtotal);
}

