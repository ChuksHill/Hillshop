import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jjsfxcmoheebjbqjglhc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2Z4Y21vaGVlYmpicWpnbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDU1ODUsImV4cCI6MjA4MzUyMTU4NX0.-2SN5i0IZIx6_Puri2mowxeQ2MWE8WC-fj5NXpo2S0Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log("--- Tables ---");
    const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables') // This might fail if RLS prevents it
        .select('table_name')
        .eq('table_schema', 'public');

    // If direct select fails (likely), we'll try to probe known tables
    if (tableError) {
        console.log("Could not list tables via information_schema (expected with anon key). Probing known tables...");
        await probeTable('products');
        await probeTable('product_images');
        await probeTable('reviews');
        await probeTable('orders');
        await probeTable('order_items');
        await probeTable('users');
        await probeTable('profiles');
    } else {
        console.log("Tables found:", tables.map(t => t.table_name));
        for (const t of tables) {
            await probeTable(t.table_name);
        }
    }

    console.log("\n--- Functions (RPC) ---");
    // Try to call the order function with dummy data to see if it exists (it handles errors gracefully hopefully)
    // Actually, calling it with invalid data might return a specific error confirming its existence.
    const { error: rpcError } = await supabase.rpc('handle_place_order', {});
    if (rpcError) {
        console.log("handle_place_order check:", rpcError.message);
    } else {
        console.log("handle_place_order exists and ran (unexpectedly without args).");
    }
}

async function probeTable(tableName) {
    console.log(`\nChecking table: ${tableName}`);
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.log(`  Error: ${error.message} (${error.code})`);
    } else {
        console.log(`  Accessible! Found ${data.length} rows.`);
        if (data.length > 0) {
            console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
        }
    }
}

inspect();
