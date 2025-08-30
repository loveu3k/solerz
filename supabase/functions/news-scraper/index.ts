// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
console.log("Edge Function Initialized: News Scraper v15 (Batched Processing)");
// Configuration for batching and logging
const BATCH_SIZE = 7; // Number of brands to process per invocation. Adjust as needed.
const DEBUG_MODE = false; // Set to true for detailed logs, false for minimal logs in production
/**
 * Parses the HTML content of a Google News search page to extract article details.
 * @param {string} html - The HTML string of the news page.
 * @returns {Array<Object>} An array of article objects, each containing title, full_content_url, source, and published_at.
 */ const parseNewsPage = (html)=>{
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) {
    if (DEBUG_MODE) console.error("[Parser] DOMParser failed to parse HTML.");
    return [];
  }
  const articles = [];
  const articleElements = doc.querySelectorAll('article.IFHyqb');
  if (DEBUG_MODE) console.log(`[Parser] Found ${articleElements.length} potential article elements.`);
  articleElements.forEach((articleEl, index)=>{
    const linkEl = articleEl.querySelector('a.JtKRv');
    const sourceEl = articleEl.querySelector('div.vr1PYe');
    const timeEl = articleEl.querySelector('time.hvbAAd');
    if (linkEl && sourceEl && timeEl) {
      const title = linkEl.textContent.trim();
      const relativeHref = linkEl.getAttribute('href');
      const full_content_url = relativeHref ? `https://news.google.com${relativeHref.slice(1)}` : '';
      const source = sourceEl.textContent.trim();
      const published_at = timeEl.getAttribute('datetime') || new Date().toISOString();
      if (full_content_url) {
        articles.push({
          title,
          full_content_url,
          source,
          published_at
        });
      } else {
        if (DEBUG_MODE) console.warn(`[Parser] Article element ${index} missing valid full_content_url.`);
      }
    } else {
      if (DEBUG_MODE) console.warn(`[Parser] Article element ${index} missing one or more key selectors (link, source, or time).`);
    }
  });
  return articles;
};
Deno.serve(async (req)=>{
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // --- OPTIMIZATION: Fetch a batch of brands ordered by last_scraped_at ---
    const { data: brandsToProcess, error: brandsError } = await supabaseClient.from('brands').select('id, name, last_scraped_at') // Select last_scraped_at as well
    .order('last_scraped_at', {
      ascending: true
    }) // Order by oldest first
    .limit(BATCH_SIZE); // Limit to the batch size
    if (brandsError) throw brandsError;
    if (brandsToProcess.length === 0) {
      console.log("No brands found to process in this batch. Exiting.");
      return new Response(JSON.stringify({
        message: 'No brands to process.'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`Starting news scraping for ${brandsToProcess.length} brands in this batch.`);
    // --- OPTIMIZATION: Fetch ALL existing news URLs ONCE ---
    const { data: allExistingNews, error: allExistingNewsError } = await supabaseClient.from('news').select('brand_id, full_content_url');
    if (allExistingNewsError) {
      console.error("Error fetching all existing news URLs:", allExistingNewsError.message);
      throw allExistingNewsError; // Critical error, stop execution
    }
    // Create a Map for efficient lookup: Map<brand_id, Set<full_content_url>>
    const existingUrlsByBrand = new Map();
    allExistingNews.forEach((newsItem)=>{
      if (!existingUrlsByBrand.has(newsItem.brand_id)) {
        existingUrlsByBrand.set(newsItem.brand_id, new Set());
      }
      existingUrlsByBrand.get(newsItem.brand_id)?.add(newsItem.full_content_url);
    });
    // --- END OPTIMIZATION ---
    for (const brand of brandsToProcess){
      if (DEBUG_MODE) console.log(`\n--- Processing Brand: ${brand.name} (ID: ${brand.id}) ---`);
      try {
        const query = encodeURIComponent(`"${brand.name}"`);
        const searchUrl = `https://news.google.com/search?q=${query}&hl=en-MY&gl=MY&ceid=MY:en&tbs=qdr:y`;
        if (DEBUG_MODE) console.log(`[${brand.name}] Fetching URL: ${searchUrl}`);
        const response = await fetch(searchUrl);
        if (!response.ok) {
          console.warn(`[${brand.name}] Failed to fetch news for brand: ${response.status} ${response.statusText}`);
          continue; // Skip to the next brand if fetch fails
        }
        const htmlText = await response.text();
        if (DEBUG_MODE) console.log(`[${brand.name}] Received HTML (first 500 chars): ${htmlText.substring(0, 500)}...`);
        const parsedArticles = parseNewsPage(htmlText);
        if (DEBUG_MODE) console.log(`[${brand.name}] Parsed ${parsedArticles.length} articles before filtering.`);
        if (parsedArticles.length === 0) {
          console.log(`[${brand.name}] No articles parsed from Google News for this brand.`);
          // Still update last_scraped_at even if no articles found, to mark it as processed
          const { error: updateBrandError } = await supabaseClient.from('brands').update({
            last_scraped_at: new Date().toISOString()
          }).eq('id', brand.id);
          if (updateBrandError) console.error(`[${brand.name}] Error updating last_scraped_at:`, updateBrandError.message);
          continue;
        }
        // Get the set of existing URLs for the current brand from the pre-fetched map
        const currentBrandExistingUrls = existingUrlsByBrand.get(brand.id) || new Set();
        const newsToInsert = parsedArticles.filter((article)=>{
          const isDuplicate = currentBrandExistingUrls.has(article.full_content_url);
          if (DEBUG_MODE && isDuplicate) {
            console.log(`[${brand.name}] Filtering out duplicate: ${article.full_content_url}`);
          }
          return !isDuplicate;
        }).map((article)=>({
            brand_id: brand.id,
            title: article.title,
            full_content_url: article.full_content_url,
            source: article.source,
            published_at: article.published_at,
            language: 'en'
          }));
        if (DEBUG_MODE) console.log(`[${brand.name}] Articles to insert after filtering (${newsToInsert.length}).`);
        if (newsToInsert.length > 0) {
          const { error: insertError } = await supabaseClient.from('news').insert(newsToInsert);
          if (insertError) {
            if (insertError.code === '23505') {
              console.warn(`[${brand.name}] Some articles were skipped due to unique constraint violation (already exist).`);
            } else {
              console.error(`[${brand.name}] Error inserting new news:`, insertError.message);
            }
          } else {
            console.log(`[${brand.name}] Successfully inserted ${newsToInsert.length} new articles.`);
          }
        } else {
          console.log(`[${brand.name}] No truly new articles to insert after filtering.`);
        }
        // --- IMPORTANT: Update last_scraped_at for the processed brand ---
        const { error: updateBrandError } = await supabaseClient.from('brands').update({
          last_scraped_at: new Date().toISOString()
        }).eq('id', brand.id);
        if (updateBrandError) {
          console.error(`[${brand.name}] Error updating last_scraped_at:`, updateBrandError.message);
        } else {
          if (DEBUG_MODE) console.log(`[${brand.name}] Updated last_scraped_at.`);
        }
      } catch (e) {
        console.error(`[${brand.name}] Error processing brand:`, e.message);
      // Do not update last_scraped_at if there was an error processing,
      // so it gets picked up in a future batch.
      }
    }
    console.log("Batch scraping task completed.");
    return new Response(JSON.stringify({
      message: `Scraping task completed for ${brandsToProcess.length} brands.`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('A critical error occurred during the main process:', error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
