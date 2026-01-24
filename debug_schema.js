
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
// We need to find the .env file. Usually in root.
// Assuming we are running this from the project root or similar.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

// We'll try to read .env from the project root if variables aren't set
import fs from 'fs';

function getEnv() {
    try {
        const envPath = path.resolve('c:/Users/ucchi/OneDrive/Desktop/Hillshop/hillshop/.env');
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        return envConfig;
    } catch (e) {
        console.error("Could not load .env file", e);
        return {};
    }
}

const env = getEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(url, key);

async function inspect() {
    console.log("Fetching one product...");
    const { data, error } = await supabase.from('products').select('*').limit(1);

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("Product Data Keys:", Object.keys(data[0]));
        console.log("Sample Product:", data[0]);
    }
}

inspect();
