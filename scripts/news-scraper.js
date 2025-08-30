import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Setup for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Starting news scraper...');

// --- Initialize Supabase Client ---
const supabaseUrl = process.env.VITE_SUPABASE_URL; // Ensure your .env uses the VITE_ prefix if created with Vite
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Fetches news from Google News RSS for a specific brand and saves it to Supabase.
 * @param {object} brand - The brand object, containing id and name.
 */
async function scrapeAndSaveNews(brand) {
  if (!brand || !brand.name || !brand.id) {
    console.error('Invalid brand object received:', brand);
    return;
  }

  try {
    const query = encodeURIComponent(`"${brand.name}"`); // Search for the exact brand name
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en&gl=US&ceid=US:en`;
    console.log(`[${brand.name}] Fetching RSS from: ${rssUrl}`);

    const { data: rssResponse } = await axios.get(rssUrl);
    const parsedData = await parseStringPromise(rssResponse);
    const articles = parsedData?.rss?.channel?.[0]?.item || [];

    console.log(`[${brand.name}] Found ${articles.length} articles.`);

    if (articles.length === 0) {
      return;
    }

    const newsItems = articles.map(article => {
      // Helper function to safely get the first element of an array
      const get = (arr) => (Array.isArray(arr) && arr.length > 0) ? arr[0] : '';
      
      const title = get(article.title);
      const link = get(article.link);
      const description = get(article.description);
      const pubDate = get(article.pubDate) ? new Date(get(article.pubDate)).toISOString() : null;
      const source = get(article.source?._);
      
      // Clean up the description from HTML tags
      const summary = description.replace(/<[^>]+>/g, '').slice(0, 300);

      return {
        brand_id: brand.id, // Use the UUID of the brand
        title,
        summary,
        full_content_url: link,
        source: source || 'Google News',
        published_at: pubDate,
        language: 'en',
        // A placeholder image can be useful if you don't have one
        preview_image_url: `https://placehold.co/600x400/EEE/31343C?text=${encodeURIComponent(brand.name)}`
      };
    }).filter(item => item.title && item.full_content_url); // Ensure essential fields exist

    if (newsItems.length > 0) {
        console.log(`[${brand.name}] Upserting ${newsItems.length} news items...`);
        const { error } = await supabase
            .from('news')
            .upsert(newsItems, { 
                onConflict: 'brand_id,full_content_url', // This is our unique constraint
                ignoreDuplicates: true 
            });

        if (error) {
            console.error(`[${brand.name}] Error saving articles:`, error.message);
        } else {
            console.log(`[${brand.name}] Successfully saved articles.`);
        }
    }

  } catch (err) {
    console.error(`[${brand.name}] An error occurred during scraping:`, err.message);
  }
}

/**
 * Main function to fetch all brands and trigger scraping for each.
 */
async function runScrapingTask() {
    console.log('------------------------------------');
    console.log(`Running cron job at: ${new Date().toISOString()}`);
    console.log('------------------------------------');
    try {
        const { data: brands, error } = await supabase.from('brands').select('id, name');

        if (error) {
            throw new Error(`Failed to fetch brands: ${error.message}`);
        }

        if (!brands || brands.length === 0) {
            console.warn('No brands found in the database. Skipping scrape cycle.');
            return;
        }

        console.log(`Found ${brands.length} brands. Starting scraping process...`);
        for (const brand of brands) {
            await scrapeAndSaveNews(brand);
        }

    } catch (err) {
        console.error('Error during the main scraping task:', err.message);
    } finally {
        console.log('------------------------------------');
        console.log('Cron job finished.');
        console.log('------------------------------------');
    }
}

// Schedule the scraping task to run once every 24 hours at midnight.
cron.schedule('0 0 * * *', runScrapingTask, {
    scheduled: true,
    timezone: "Asia/Kuala_Lumpur"
});

console.log('News scraper initialized. Scheduled to run every 24 hours.');
console.log('Running the first task immediately on startup...');
runScrapingTask(); // Run the task once on startup

