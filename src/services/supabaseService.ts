import { supabase } from "@/integrations/supabase/client";
import { Bairro, Product, AlcoholOption } from "../types";

// Categories
export const fetchCategories = async () => {
  console.log("Fetching categories from Supabase...");
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index');
  
  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
  
  // Se não houver categorias, retorna um array vazio
  if (!data || data.length === 0) {
    console.log("No categories found in Supabase");
    return [];
  }
  
  console.log("Categories fetched:", data);
  return data.map(category => category.name);
};

export const saveCategory = async (name: string, index: number) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, order_index: index }]);
  
  if (error) {
    console.error("Error saving category:", error);
    throw error;
  }
  
  return data;
};

export const updateCategory = async (oldName: string, newName: string, index: number) => {
  // First, get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', oldName)
    .single();
  
  if (categoryError) {
    console.error("Error finding category:", categoryError);
    throw categoryError;
  }
  
  const { data, error } = await supabase
    .from('categories')
    .update({ name: newName, order_index: index })
    .eq('id', categoryData.id);
  
  if (error) {
    console.error("Error updating category:", error);
    throw error;
  }
  
  return data;
};

export const deleteCategory = async (name: string) => {
  // First, get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .single();
  
  if (categoryError) {
    console.error("Error finding category:", categoryError);
    throw categoryError;
  }
  
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryData.id);
  
  if (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
  
  return data;
};

export const moveCategoryOrder = async (categories: string[]) => {
  // Get all categories with their IDs
  const { data: categoryData, error: fetchError } = await supabase
    .from('categories')
    .select('id, name')
    .in('name', categories);
  
  if (fetchError) {
    console.error("Error fetching categories for reordering:", fetchError);
    throw fetchError;
  }
  
  // Create a map of category names to their IDs
  const categoryMap = categoryData.reduce((map, category) => {
    map[category.name] = category.id;
    return map;
  }, {});
  
  // Update each category with its new order index
  for (let i = 0; i < categories.length; i++) {
    const categoryName = categories[i];
    const categoryId = categoryMap[categoryName];
    
    if (categoryId) {
      const { error } = await supabase
        .from('categories')
        .update({ order_index: i })
        .eq('id', categoryId);
      
      if (error) {
        console.error(`Error updating order for category ${categoryName}:`, error);
        throw error;
      }
    }
  }
  
  return true;
};

// Products
export const fetchProducts = async (categoryName: string) => {
  // First, get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();
  
  if (categoryError) {
    console.error("Error finding category:", categoryError);
    return [];
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryData.id);
  
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  
  return data.map(product => ({
    name: product.name,
    price: product.price,
    category: categoryName
  }));
};

export const saveProduct = async (product: Product) => {
  // First, get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', product.category)
    .single();
  
  if (categoryError) {
    console.error("Error finding category:", categoryError);
    throw categoryError;
  }
  
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      price: product.price,
      category_id: categoryData.id
    }]);
  
  if (error) {
    console.error("Error saving product:", error);
    throw error;
  }
  
  return data;
};

export const updateProduct = async (product: Product, oldName: string) => {
  // First, get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', product.category)
    .single();
  
  if (categoryError) {
    console.error("Error finding category:", categoryError);
    throw categoryError;
  }
  
  // Then, get the product ID
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('name', oldName)
    .eq('category_id', categoryData.id)
    .single();
  
  if (productError) {
    console.error("Error finding product:", productError);
    throw productError;
  }
  
  const { data, error } = await supabase
    .from('products')
    .update({
      name: product.name,
      price: product.price
    })
    .eq('id', productData.id);
  
  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }
  
  return data;
};

export const deleteProduct = async (product: Pick<Product, 'name' | 'category'>) => {
  // First, get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', product.category)
    .single();
  
  if (categoryError) {
    console.error("Error finding category:", categoryError);
    throw categoryError;
  }
  
  // Then, get the product ID
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('name', product.name)
    .eq('category_id', categoryData.id)
    .single();
  
  if (productError) {
    console.error("Error finding product:", productError);
    throw productError;
  }
  
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', productData.id);
  
  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
  
  return data;
};

// Bairros (Neighborhoods)
export const fetchBairros = async () => {
  const { data, error } = await supabase
    .from('bairros')
    .select('*')
    .order('nome');
  
  if (error) {
    console.error("Error fetching bairros:", error);
    throw error;
  }
  
  return data.map(bairro => ({
    nome: bairro.nome,
    taxa: bairro.taxa
  }));
};

export const saveBairro = async (bairro: Bairro) => {
  const { data, error } = await supabase
    .from('bairros')
    .insert([{
      nome: bairro.nome,
      taxa: bairro.taxa
    }]);
  
  if (error) {
    console.error("Error saving bairro:", error);
    throw error;
  }
  
  return data;
};

export const updateBairro = async (oldNome: string, bairro: Bairro) => {
  // Get the bairro ID
  const { data: bairroData, error: bairroError } = await supabase
    .from('bairros')
    .select('id')
    .eq('nome', oldNome)
    .single();
  
  if (bairroError) {
    console.error("Error finding bairro:", bairroError);
    throw bairroError;
  }
  
  const { data, error } = await supabase
    .from('bairros')
    .update({
      nome: bairro.nome,
      taxa: bairro.taxa
    })
    .eq('id', bairroData.id);
  
  if (error) {
    console.error("Error updating bairro:", error);
    throw error;
  }
  
  return data;
};

export const deleteBairro = async (nome: string) => {
  // Get the bairro ID
  const { data: bairroData, error: bairroError } = await supabase
    .from('bairros')
    .select('id')
    .eq('nome', nome)
    .single();
  
  if (bairroError) {
    console.error("Error finding bairro:", bairroError);
    throw bairroError;
  }
  
  const { data, error } = await supabase
    .from('bairros')
    .delete()
    .eq('id', bairroData.id);
  
  if (error) {
    console.error("Error deleting bairro:", error);
    throw error;
  }
  
  return data;
};

// Ice Flavors
export const fetchIceFlavors = async () => {
  const { data, error } = await supabase
    .from('ice_flavors')
    .select('*')
    .order('name');
  
  if (error) {
    console.error("Error fetching ice flavors:", error);
    throw error;
  }
  
  return data.map(flavor => flavor.name);
};

// Alcohol Options
export const fetchAlcoholOptions = async () => {
  const { data, error } = await supabase
    .from('alcohol_options')
    .select('*')
    .order('name');
  
  if (error) {
    console.error("Error fetching alcohol options:", error);
    throw error;
  }
  
  return data.map(option => ({
    name: option.name,
    extraCost: option.extra_cost
  }));
};

// Migration helper - use this to initially populate the database with existing data
export const migrateExistingData = async (
  categories: string[],
  products: Record<string, Product[]>,
  bairros: Bairro[],
  iceFlavors: string[],
  alcoholOptions: AlcoholOption[]
) => {
  console.log("Starting data migration to Supabase...");
  
  // Migrate categories
  console.log("Migrating categories...");
  for (let i = 0; i < categories.length; i++) {
    try {
      await supabase
        .from('categories')
        .upsert([{
          name: categories[i],
          order_index: i
        }], { onConflict: 'name' });
      console.log(`Category migrated: ${categories[i]}`);
    } catch (error) {
      console.error(`Error migrating category ${categories[i]}:`, error);
    }
  }
  
  // Get all categories with their IDs
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id, name');
    
  const categoryMap = {};
  if (categoryData) {
    categoryData.forEach(category => {
      categoryMap[category.name] = category.id;
    });
  }
  
  console.log("Category map:", categoryMap);
  
  // Migrate products
  console.log("Migrating products...");
  for (const categoryName in products) {
    const categoryId = categoryMap[categoryName];
    
    if (categoryId) {
      for (const product of products[categoryName]) {
        try {
          await supabase
            .from('products')
            .upsert([{
              name: product.name,
              price: product.price,
              category_id: categoryId
            }], { onConflict: 'name, category_id' });
          console.log(`Product migrated: ${product.name} in category ${categoryName}`);
        } catch (error) {
          console.error(`Error migrating product ${product.name}:`, error);
        }
      }
    } else {
      console.error(`Category ID not found for: ${categoryName}`);
    }
  }
  
  // Migrate bairros
  console.log("Migrating bairros...");
  for (const bairro of bairros) {
    try {
      await supabase
        .from('bairros')
        .upsert([{
          nome: bairro.nome,
          taxa: bairro.taxa
        }], { onConflict: 'nome' });
      console.log(`Bairro migrated: ${bairro.nome}`);
    } catch (error) {
      console.error(`Error migrating bairro ${bairro.nome}:`, error);
    }
  }
  
  // Migrate ice flavors
  console.log("Migrating ice flavors...");
  for (const flavor of iceFlavors) {
    try {
      await supabase
        .from('ice_flavors')
        .upsert([{
          name: flavor
        }], { onConflict: 'name' });
      console.log(`Ice flavor migrated: ${flavor}`);
    } catch (error) {
      console.error(`Error migrating ice flavor ${flavor}:`, error);
    }
  }
  
  // Migrate alcohol options
  console.log("Migrating alcohol options...");
  for (const option of alcoholOptions) {
    try {
      await supabase
        .from('alcohol_options')
        .upsert([{
          name: option.name,
          extra_cost: option.extraCost
        }], { onConflict: 'name' });
      console.log(`Alcohol option migrated: ${option.name}`);
    } catch (error) {
      console.error(`Error migrating alcohol option ${option.name}:`, error);
    }
  }
  
  console.log("Data migration completed successfully!");
  return true;
};
