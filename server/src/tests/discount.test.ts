import { describe, it, expect } from '@jest/globals';
import { calculateDiscountPrice, calculateOrderDiscount } from '../utils/discount';

describe('Discount Calculations', () => {
  describe('calculateDiscountPrice', () => {
    it('should calculate percentage discount correctly', () => {
      const product = {
        price: 100000, // 1000 руб
        compareAt: null,
        discounts: [
          {
            discount: {
              type: 'PERCENT' as const,
              value: 10 // 10%
            }
          }
        ]
      };

      const result = calculateDiscountPrice(product);
      
      expect(result.finalPrice).toBe(90000); // 900 руб
      expect(result.discount).toEqual({
        amount: 10000, // 100 руб
        percentage: 10
      });
    });

    it('should calculate fixed discount correctly', () => {
      const product = {
        price: 100000, // 1000 руб
        compareAt: null,
        discounts: [
          {
            discount: {
              type: 'FIXED' as const,
              value: 15000 // 150 руб
            }
          }
        ]
      };

      const result = calculateDiscountPrice(product);
      
      expect(result.finalPrice).toBe(85000); // 850 руб
      expect(result.discount).toEqual({
        amount: 15000,
        percentage: 15
      });
    });

    it('should use compareAt price if better than discount', () => {
      const product = {
        price: 100000, // 1000 руб
        compareAt: 120000, // 1200 руб
        discounts: [
          {
            discount: {
              type: 'PERCENT' as const,
              value: 10 // 10%
            }
          }
        ]
      };

      const result = calculateDiscountPrice(product);
      
      expect(result.finalPrice).toBe(100000); // Current price
      expect(result.discount).toEqual({
        amount: 20000, // 200 руб (from compareAt)
        percentage: 17
      });
    });

    it('should choose best discount from multiple', () => {
      const product = {
        price: 100000,
        compareAt: null,
        discounts: [
          {
            discount: {
              type: 'PERCENT' as const,
              value: 10
            }
          },
          {
            discount: {
              type: 'FIXED' as const,
              value: 20000 // Better discount
            }
          }
        ]
      };

      const result = calculateDiscountPrice(product);
      
      expect(result.finalPrice).toBe(80000);
      expect(result.discount?.amount).toBe(20000);
    });

    it('should handle no discounts', () => {
      const product = {
        price: 100000,
        compareAt: null,
        discounts: []
      };

      const result = calculateDiscountPrice(product);
      
      expect(result.finalPrice).toBe(100000);
      expect(result.discount).toBeNull();
    });
  });

  describe('calculateOrderDiscount', () => {
    it('should calculate percentage discount on order', () => {
      const subtotal = 200000; // 2000 руб
      const discount = {
        type: 'PERCENT' as const,
        value: 15 // 15%
      };

      const result = calculateOrderDiscount(subtotal, discount);
      
      expect(result).toBe(30000); // 300 руб
    });

    it('should calculate fixed discount on order', () => {
      const subtotal = 200000;
      const discount = {
        type: 'FIXED' as const,
        value: 50000 // 500 руб
      };

      const result = calculateOrderDiscount(subtotal, discount);
      
      expect(result).toBe(50000);
    });

    it('should not exceed subtotal for fixed discount', () => {
      const subtotal = 30000; // 300 руб
      const discount = {
        type: 'FIXED' as const,
        value: 50000 // 500 руб
      };

      const result = calculateOrderDiscount(subtotal, discount);
      
      expect(result).toBe(30000); // Can't discount more than total
    });

    it('should return 0 for null discount', () => {
      const result = calculateOrderDiscount(100000, null);
      
      expect(result).toBe(0);
    });
  });
});







