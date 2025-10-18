
/**
 * Utility functions for calculating discounts
 */

/**
 * Calculates discount for beer products when quantity is a multiple of 12
 * @param product The product to check
 * @returns Object containing information about discount and final price
 */
export const calculateBeerDiscount = (product: {
  name: string;
  price: number;
  qty?: number;
  category?: string;
}) => {
  // Only process beer products with quantity
  if (
    !product.category?.toLowerCase().includes('cerveja') || 
    !product.qty
  ) {
    return {
      hasDiscount: false,
      discountedPrice: (product.price || 0) * (product.qty || 1),
      discountPercentage: 0,
      discountedUnits: 0,
      regularUnits: product.qty || 0,
    };
  }

  const qty = product.qty || 0;
  const discountedUnits = Math.floor(qty / 12) * 12; // Multiple of 12
  const regularUnits = qty % 12; // Remaining units
  
  if (discountedUnits === 0) {
    return {
      hasDiscount: false,
      discountedPrice: product.price * qty,
      discountPercentage: 0,
      discountedUnits: 0,
      regularUnits: qty,
    };
  }
  
  // Apply 23% discount to units that are multiples of 12
  const discountPercentage = 23;
  const discountedUnitPrice = product.price * (1 - discountPercentage / 100);
  
  // Calculate final price: (discounted units * discounted price) + (regular units * regular price)
  const discountedPrice = 
    (discountedUnits * discountedUnitPrice) + 
    (regularUnits * product.price);
  
  return {
    hasDiscount: true,
    discountedPrice,
    discountPercentage,
    discountedUnits,
    regularUnits,
  };
};

/**
 * Gets the display price for a product with possible discount applied
 */
export const getProductDisplayPrice = (product: {
  name: string;
  price: number;
  qty?: number;
  category?: string;
}) => {
  const discountInfo = calculateBeerDiscount(product);
  return discountInfo.hasDiscount ? discountInfo.discountedPrice : (product.price || 0) * (product.qty || 1);
};
