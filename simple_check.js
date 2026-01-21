
const supabaseUrl = 'https://jjsfxcmoheebjbqjglhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2Z4Y21vaGVlYmpicWpnbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDU1ODUsImV4cCI6MjA4MzUyMTU4NX0.-2SN5i0IZIx6_Puri2mowxeQ2MWE8WC-fj5NXpo2S0Y';
async function check() {
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const pRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,image_url&name=ilike.*55*`, { headers });
    const products = await pRes.json();
    for (const p of products) {
        console.log('ID:', p.id);
        console.log('Name:', p.name);
        console.log('Product-Table-Img:', p.image_url);
        const iRes = await fetch(`${supabaseUrl}/rest/v1/product_images?select=image_url,created_at&product_id=eq.${p.id}`, { headers });
        const images = await iRes.json();
        console.log('Images-Table-Count:', images.length);
        images.forEach((i, idx) => console.log(`   Img ${idx + 1} [${i.created_at}]:`, i.image_url));
    }
}
check();
