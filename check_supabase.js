
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
    console.log('Checking Supabase for "55"...');

    // 1. Find the product
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%55%');

    if (pError) {
        console.error('Error fetching products:', pError);
        return;
    }

    if (products.length === 0) {
        console.log('No product found with "55" in the name.');
        return;
    }

    const product = products[0];
    console.log('\n--- Product Found ---');
    console.log('ID:', product.id);
    console.log('Name:', product.name);
    console.log('Image URL (column in products):', product.image_url || 'MISSING (Step 2 not done?)');

    // 2. Find images for this product
    const { data: images, error: iError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

    if (iError) {
        console.error('Error fetching images:', iError);
        return;
    }

    console.log('\n--- Images in product_images table ---');
    console.log(`Total images found: ${images.length}`);
    images.forEach((img, index) => {
        console.log(`${index + 1}. URL: ${img.image_url}`);
        console.log(`   Created At: ${img.created_at}`);
    });

    if (images.length > 1) {
        console.log('\nWARNING: You have multiple images for this product. The frontend is likely grabbing the oldest one as "Main".');
    }
}

checkProduct();
