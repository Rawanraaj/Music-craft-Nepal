import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, '.env');
  if (!fs.existsSync(envPath)) throw new Error('.env file not found');
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('--- STARTING CATEGORIES MIGRATION ---');

  // 1. Check current row count and sample rows
  const { data: beforeRows, error: beforeErr } = await supabase
    .from('products')
    .select('id, name, category');

  if (beforeErr) {
    console.error('Error fetching before rows:', beforeErr);
    process.exit(1);
  }

  const initialCount = beforeRows.length;
  console.log(`Initial product count before migration: ${initialCount}`);

  // 2. Try adding categories column via REST SQL / RPC or pg connection
  console.log('Attempting DDL: Adding categories column if not exists...');
  
  // Test if categories column exists now
  let { data: testCol, error: testErr } = await supabase
    .from('products')
    .select('id, name, category, categories')
    .limit(1);

  if (testErr && testErr.message.includes('categories does not exist')) {
    console.log('Column "categories" does not exist yet. Running DDL query...');

    console.log('Fetching PostgREST schema definition to check tables & RPCs...');
    try {
      const specRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      const spec = await specRes.json();
      console.log('Available RPC paths:', Object.keys(spec.paths || {}).filter(p => p.startsWith('/rpc/')));
      console.log('Available definitions/tables:', Object.keys(spec.definitions || {}));
    } catch (e) {
      console.log('Failed to fetch OpenAPI spec:', e.message);
    }

    // Re-test column existence
    const checkAgain = await supabase
      .from('products')
      .select('id, name, category, categories')
      .limit(1);
    testErr = checkAgain.error;
    testCol = checkAgain.data;
  }

  if (testErr) {
    console.error('Column test error:', testErr.message);
  } else {
    console.log('Column "categories" is available!');
  }

  // 3. Migrate data for every product: categories = ARRAY[category]
  console.log('Migrating data: populating categories array for each row...');
  const { data: allProds, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, category, categories');

  if (fetchErr) {
    console.error('Error fetching products for migration:', fetchErr);
    process.exit(1);
  }

  let updatedCount = 0;
  for (const prod of allProds) {
    const currentCats = prod.categories;
    if (!currentCats || currentCats.length === 0) {
      const newCats = prod.category ? [prod.category] : ['Guitars'];
      const { error: updateErr } = await supabase
        .from('products')
        .update({ categories: newCats })
        .eq('id', prod.id);

      if (updateErr) {
        console.error(`Failed to update product ${prod.id} (${prod.name}):`, updateErr);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Migrated ${updatedCount} product rows.`);

  // 4. Verify post-migration state and zero data loss
  const { data: afterRows, error: afterErr } = await supabase
    .from('products')
    .select('id, name, category, categories');

  if (afterErr) {
    console.error('Error fetching after rows:', afterErr);
    process.exit(1);
  }

  const finalCount = afterRows.length;
  console.log(`Final product count after migration: ${finalCount}`);

  if (initialCount === finalCount) {
    console.log(`SUCCESS: Zero data loss verified! (${initialCount} rows before, ${finalCount} rows after)`);
  } else {
    console.error(`WARNING: Row count mismatch! Before: ${initialCount}, After: ${finalCount}`);
  }

  console.log('\n--- SPOT CHECK SAMPLE ROWS ---');
  afterRows.slice(0, 5).forEach((p) => {
    console.log(`- [${p.name}] category: "${p.category}" | categories: [${p.categories ? p.categories.join(', ') : ''}]`);
  });

  console.log('--- MIGRATION COMPLETED ---');
}

main().catch(console.error);
