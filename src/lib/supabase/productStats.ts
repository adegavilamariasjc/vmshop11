import { supabase } from './client';

export const trackProductView = async (productId: number | undefined) => {
  if (!productId || productId === undefined) {
    console.warn('Attempted to track product view without valid product ID');
    return;
  }
  
  try {
    const { error } = await supabase.rpc('track_product_view', {
      p_product_id: productId
    });
    if (error) console.error('Error tracking product view:', error);
  } catch (err) {
    console.error('Error tracking product view:', err);
  }
};

export const trackCartAddition = async (productId: number | undefined) => {
  if (!productId || productId === undefined) {
    console.warn('Attempted to track cart addition without valid product ID');
    return;
  }
  
  try {
    const { error } = await supabase.rpc('track_cart_addition', {
      p_product_id: productId
    });
    if (error) console.error('Error tracking cart addition:', error);
  } catch (err) {
    console.error('Error tracking cart addition:', err);
  }
};

export const trackPurchase = async (productId: number | undefined) => {
  if (!productId || productId === undefined) {
    console.warn('Attempted to track purchase without valid product ID');
    return;
  }
  
  try {
    const { error } = await supabase.rpc('track_purchase', {
      p_product_id: productId
    });
    if (error) console.error('Error tracking purchase:', error);
  } catch (err) {
    console.error('Error tracking purchase:', err);
  }
};

export const searchProductsEnhanced = async (searchTerm: string) => {
  try {
    const { data, error } = await supabase.rpc('search_products_enhanced', {
      search_term: searchTerm
    });
    
    if (error) {
      console.error('Error searching products:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error searching products:', err);
    return [];
  }
};
