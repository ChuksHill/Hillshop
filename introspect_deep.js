import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Get these from your .env or just hardcode as observed
const SUPABASE_URL = "https://jjsfxcmoheebjbqjglhc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2Z4Y21vaGVlYmpicWpnbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDU1ODUsImV4cCI6MjA4MzUyMTU4NX0.-2SN5i0IZIx6_Puri2mowxeQ2MWE8WC-fj5NXpo2S0Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const results = {};

async function probeTable(tableName) {
    const tableResult = {
        name: tableName,
        accessible: false,
        rowCount: 0,
        columns: [],
        insertPermission: 'unknown', // 'allowed', 'denied', 'error'
        error: null
    };

    console.log(`Probing ${tableName}...`);

    // READ CHECK
    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
        tableResult.error = error.message;
        if (error.code === '42P01') {
            tableResult.status = "DOES_NOT_EXIST";
        } else {
            tableResult.status = "ACCESS_DENIED_OR_ERROR";
        }
    } else {
        tableResult.accessible = true;
        tableResult.rowCount = data.length; // Just sample
        if (data.length > 0) {
            tableResult.columns = Object.keys(data[0]);
        } else {
            tableResult.status = "EMPTY_BUT_ACCESSIBLE";
        }

        // INSERT CHECK (Only if accessible)
        // Try to insert an empty object or something minimal that might fail constraint validation but PASS RLS
        // If we get "new row violates row-level security policy", we know RLS is on and blocking.
        // If we get "violates not-null constraint", we know we HAVE permission but sent bad data.
        const { error: insertError } = await supabase.from(tableName).insert({});
        if (insertError) {
            tableResult.insertError = insertError.message;
            if (insertError.message.includes("row-level security policy")) {
                tableResult.insertPermission = "RLS_DENIED";
            } else {
                tableResult.insertPermission = "ALLOWED_BUT_FAILED_VALIDATION"; // Which means we COULD write if data was good
            }
        } else {
            tableResult.insertPermission = "ALLOWED_AND_SUCCEEDED"; // Unlikely with empty object, but possible
        }
    }

    results[tableName] = tableResult;
}

async function checkRPC() {
    console.log("Checking RPC handle_place_order...");
    // Call with minimal args to see if it exists
    const { data, error } = await supabase.rpc('handle_place_order', {
        p_full_name: 'Test',
        p_email: 'test@test.com',
        p_address: '123 Test St',
        p_city: 'Test City',
        p_postal_code: '12345',
        p_delivery_method: 'standard',
        p_payment_method: 'card',
        p_items: []
    });

    results['rpc_handle_place_order'] = {
        exists: !error || error.code !== '42883', // 42883 is undefined function
        error: error ? error.message : null,
        success: !!data
    };
}

async function main() {
    const tables = ['products', 'product_images', 'reviews', 'orders', 'order_items', 'users', 'profiles'];

    for (const t of tables) {
        await probeTable(t);
    }

    await checkRPC();

    fs.writeFileSync('introspection_result.json', JSON.stringify(results, null, 2));
    console.log("Done. Results written to introspection_result.json");
}

main();
