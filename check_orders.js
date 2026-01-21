
const supabaseUrl = 'https://jjsfxcmoheebjbqjglhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2Z4Y21vaGVlYmpicWpnbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDU1ODUsImV4cCI6MjA4MzUyMTU4NX0.-2SN5i0IZIx6_Puri2mowxeQ2MWE8WC-fj5NXpo2S0Y';

async function check() {
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/?select=id`, { method: 'GET', headers });
        // This isn't the right way to check for table existence via REST API easily without guessing.
        // Let's just try to fetch from 'orders'
        const oRes = await fetch(`${supabaseUrl}/rest/v1/orders?limit=1`, { headers });
        if (oRes.status === 200) {
            console.log('Orders table EXISTS');
        } else {
            console.log('Orders table does NOT exist or Access Denied. Status:', oRes.status);
        }
    } catch (e) {
        console.log('Error checking orders table');
    }
}
check();
