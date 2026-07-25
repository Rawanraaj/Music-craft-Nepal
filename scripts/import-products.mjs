/**
 * One-time product import script for Music Craft Nepal.
 *
 * Usage:
 *   node scripts/import-products.mjs
 *
 * Requires:
 *   - .env with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - src/import-data/products_manifest.csv
 *   - src/import-data/images/ folder with product photos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ---------- resolve paths ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ---------- load .env manually (no dotenv dependency needed) ----------
function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found at ' + envPath);
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const STORAGE_BUCKET = 'product-images';
const CSV_PATH = path.join(PROJECT_ROOT, 'src', 'import-data', 'products_manifest.csv');
const IMAGES_BASE = path.join(PROJECT_ROOT, 'src', 'import-data');

// ---------- minimal RFC 4180 CSV parser (handles quoted fields + newlines) ----------
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  function readField() {
    if (i >= len) return '';
    if (text[i] === '"') {
      // quoted field
      i++; // skip opening quote
      let field = '';
      while (i < len) {
        if (text[i] === '"') {
          if (i + 1 < len && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else {
            i++; // skip closing quote
            break;
          }
        } else {
          field += text[i];
          i++;
        }
      }
      return field;
    } else {
      // unquoted field
      let field = '';
      while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
        field += text[i];
        i++;
      }
      return field;
    }
  }

  while (i < len) {
    const row = [];
    while (true) {
      row.push(readField());
      if (i < len && text[i] === ',') {
        i++; // skip comma
        continue;
      }
      // end of row
      if (i < len && text[i] === '\r') i++;
      if (i < len && text[i] === '\n') i++;
      break;
    }
    // skip completely empty trailing rows
    if (row.length === 1 && row[0] === '' && i >= len) break;
    rows.push(row);
  }
  return rows;
}

// ---------- helpers ----------
function getMimeType(ext) {
  const map = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

async function uploadImage(localRelPath, slug, idx) {
  const absPath = path.join(IMAGES_BASE, localRelPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Image file not found: ${absPath}`);
  }
  const ext = path.extname(absPath);
  const storagePath = `products/${slug}/${slug}-${idx}${ext}`;
  const fileBuffer = fs.readFileSync(absPath);
  const contentType = getMimeType(ext);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed for ${storagePath}: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ---------- main ----------
async function main() {
  console.log('='.repeat(60));
  console.log('  Music Craft Nepal — Product Import Script');
  console.log('='.repeat(60));
  console.log(`Supabase URL : ${SUPABASE_URL}`);
  console.log(`CSV file     : ${CSV_PATH}`);
  console.log();

  // 1) Read and parse CSV
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: CSV not found at ${CSV_PATH}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const allRows = parseCSV(csvText);

  // first row is header
  const header = allRows[0].map((h) => h.trim().toLowerCase());
  const dataRows = allRows.slice(1).filter((r) => r.length >= 4 && r[0].trim() !== '');

  const colIdx = {};
  header.forEach((h, i) => (colIdx[h] = i));

  console.log(`Parsed ${dataRows.length} product rows from CSV.`);
  console.log(`Columns: ${header.join(', ')}`);
  console.log();

  // 2) Ensure storage bucket exists
  console.log(`Ensuring storage bucket "${STORAGE_BUCKET}" exists...`);
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);
  if (!bucketExists) {
    const { error: bucketError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10485760, // 10 MB
    });
    if (bucketError) {
      console.error(`FATAL: Could not create bucket: ${bucketError.message}`);
      process.exit(1);
    }
    console.log(`Bucket "${STORAGE_BUCKET}" created (public).\n`);
  } else {
    console.log(`Bucket "${STORAGE_BUCKET}" already exists.\n`);
  }

  // 3) Delete old placeholder products
  console.log('Deleting all existing products...');
  const { error: delError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) {
    console.error(`WARNING: delete failed: ${delError.message}. Continuing anyway...`);
  } else {
    console.log('Old products deleted.\n');
  }

  // 4) Import each product
  const successes = [];
  const failures = [];
  const slugCounts = new Map();

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const name = (row[colIdx['name']] || '').trim();
    const rawSlug = (row[colIdx['slug']] || '').trim();

    // Ensure slug is unique
    let slug = rawSlug;
    if (slugCounts.has(rawSlug)) {
      const count = slugCounts.get(rawSlug) + 1;
      slugCounts.set(rawSlug, count);
      slug = `${rawSlug}-${count}`;
    } else {
      slugCounts.set(rawSlug, 1);
    }

    const category = (row[colIdx['category']] || '').trim();
    const price = parseFloat(row[colIdx['price']] || '0') || 0;
    const originalPrice = parseFloat(row[colIdx['original_price']] || '0') || null;
    const description = (row[colIdx['description']] || '').trim();
    const imagePaths = (row[colIdx['image_paths']] || '')
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean);

    const progressPct = (((i + 1) / dataRows.length) * 100).toFixed(1);
    process.stdout.write(`[${i + 1}/${dataRows.length}] (${progressPct}%) ${slug.substring(0, 50).padEnd(50)} `);

    try {
      // Upload images
      const imageUrls = [];
      for (let j = 0; j < imagePaths.length; j++) {
        const url = await uploadImage(imagePaths[j], slug, j + 1);
        imageUrls.push(url);
      }

      // Insert product row
      const { error: insertError } = await supabase.from('products').insert({
        name,
        slug,
        category,
        price,
        original_price: originalPrice,
        description,
        images: imageUrls,
        stock_quantity: 10,
        low_stock_threshold: 3,
        in_stock: true,
        rating: 0,
        review_count: 0,
        specs: [],
        features: [],
        variants: [],
      });

      if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);

      successes.push(slug);
      console.log(`✓ ${imageUrls.length} img`);
    } catch (err) {
      failures.push({ slug: slug || `row-${i + 1}`, name, error: err.message });
      console.log(`✗ FAIL: ${err.message}`);
    }
  }

  // 4) Summary
  console.log('\n' + '='.repeat(60));
  console.log('  IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Total rows   : ${dataRows.length}`);
  console.log(`  Succeeded    : ${successes.length}`);
  console.log(`  Failed       : ${failures.length}`);

  if (failures.length > 0) {
    console.log('\n  FAILURES:');
    for (const f of failures) {
      console.log(`    - ${f.slug}: ${f.error}`);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
