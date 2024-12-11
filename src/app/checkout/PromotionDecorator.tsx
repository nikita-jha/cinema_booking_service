// PromotionDecorator.ts
export interface Promotion {
    apply(orderTotal: number): { discountedTotal: number; discountApplied: boolean };
  }
  
  export class BasePromotion implements Promotion {
    apply(orderTotal: number): { discountedTotal: number; discountApplied: boolean } {
      return { discountedTotal: orderTotal, discountApplied: false };
    }
  }
  
  export class PercentagePromotion implements Promotion {
    private base: Promotion;
    private discountPercentage: number;
  
    constructor(base: Promotion, discountPercentage: number) {
      this.base = base;
      this.discountPercentage = discountPercentage;
    }
  
    apply(orderTotal: number): { discountedTotal: number; discountApplied: boolean } {
      const { discountedTotal } = this.base.apply(orderTotal);
      const discount = discountedTotal * (this.discountPercentage / 100);
      return {
        discountedTotal: discountedTotal - discount,
        discountApplied: true,
      };
    }
  }
  
  export class PromotionDecoratorFactory {
    static createPromotion(promoCode: string, base: Promotion): Promotion {
      if (promoCode === "DISCOUNT10") {
        return new PercentagePromotion(base, 10);
      }
      return base;
    }
  }
  