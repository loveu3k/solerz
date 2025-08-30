// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Edge Function Initialized: YouTube Video Scraper v15 (Quota Management)");

// Configuration for batching and logging
const BATCH_SIZE = 5; // Number of brands to process per invocation. Adjust as needed.
const DEBUG_MODE = true; // Set to true for detailed logs, false for minimal logs in production

// IMPORTANT: Limit YouTube API calls per brand per Edge Function invocation
// Each playlistItems request costs 1 unit. 10,000 units/day free tier.
// 5 brands * 50 videos/page * 20 pages = 1000 requests (too much!)
// Adjust this limit carefully. For example, 10-20 requests per brand per run might be reasonable.
// If a channel has many historical videos, it will take multiple cron runs to fetch them all.
const YOUTUBE_API_CALL_LIMIT_PER_BRAND = 15; // Max YouTube API requests per channel per single Edge Function run

// Define solar-specific keywords to ensure video relevance
const SOLAR_KEYWORDS = [
  'solar',
  'panel',
  'module',
  'photovoltaic',
  'inverter',
  'pv',
  'cell',
  'wafer',
  'heterojunction',
  'topcon',
  'perc',
  'energy',
  'power',
  'battery',
  'storage'
];

Deno.serve(async (_req) => {
  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!YOUTUBE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing one or more required environment variables (YOUTUBE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).");
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: brandsToProcess, error: brandsError } = await supabaseClient
      .from('brands')
      .select('id, name, youtube_channel_id, youtube_last_scraped_at')
      .order('youtube_last_scraped_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (brandsError) throw brandsError;

    if (brandsToProcess.length === 0) {
      console.log("No brands found to process in this YouTube video batch. Exiting.");
      return new Response(JSON.stringify({
        message: 'No brands to process in this YouTube video batch.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Starting YouTube video scraping for ${brandsToProcess.length} brands in this batch.`);

    for (const brand of brandsToProcess) {
      console.log(`\n--- Processing YouTube Channel for Brand: ${brand.name} (ID: ${brand.id}) ---`);

      if (!brand.youtube_channel_id) {
        console.log(`[${brand.name}] Skipping: No YouTube Channel ID configured.`);
        const { error: updateBrandError } = await supabaseClient
          .from('brands')
          .update({ youtube_last_scraped_at: new Date().toISOString() })
          .eq('id', brand.id);
        if (updateBrandError) console.error(`[${brand.name}] Error updating youtube_last_scraped_at:`, updateBrandError.message);
        continue;
      }

      try {
        const uploadsPlaylistId = brand.youtube_channel_id.replace(/^UC/, 'UU');

        const tenYearsAgo = new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000);
        const publishedAfterDate = brand.youtube_last_scraped_at
          ? new Date(brand.youtube_last_scraped_at)
          : tenYearsAgo;
        const isHistoricalScrape = (new Date().getTime() - publishedAfterDate.getTime()) > (30 * 24 * 60 * 60 * 1000);
        let currentApiCallCount = 0;

        if (DEBUG_MODE) console.log(`[${brand.name}] Is historical scrape: ${isHistoricalScrape}. Fetching videos published after: ${publishedAfterDate.toISOString()}`);

        let allPlaylistItems = [];
        let nextPageToken = null;
        let latestVideoPublishedAt: string | null = null;

        do {
          // This is the line that was causing the error if the constant wasn't defined
          if (isHistoricalScrape && currentApiCallCount >= YOUTUBE_API_CALL_LIMIT_PER_BRAND) {
            console.warn(`[${brand.name}] Reached API call limit (${YOUTUBE_API_CALL_LIMIT_PER_BRAND}) for historical scrape. Will continue in next batch.`);
            break;
          }

          let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}&maxResults=50&publishedAfter=${publishedAfterDate.toISOString()}`;
          if (nextPageToken) {
            playlistUrl += `&pageToken=${nextPageToken}`;
          }

          if (DEBUG_MODE) console.log(`[${brand.name}] YouTube API Request URL: ${playlistUrl}`);

          const response = await fetch(playlistUrl);
          currentApiCallCount++;

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`[${brand.name}] YouTube API Error fetching playlist:`, errorData.error.message);
            if (errorData.error.message.includes('quota')) {
              console.error(`[${brand.name}] Quota exceeded. Stopping further YouTube API calls for this brand in this batch.`);
              nextPageToken = null;
            } else {
              nextPageToken = null;
            }
            break;
          }

          const playlistData = await response.json();
          if (playlistData.items && playlistData.items.length > 0) {
            allPlaylistItems.push(...playlistData.items);
            const currentBatchLatest = playlistData.items[0].snippet.publishedAt;
            if (!latestVideoPublishedAt || currentBatchLatest > latestVideoPublishedAt) {
                latestVideoPublishedAt = currentBatchLatest;
            }
          }
          nextPageToken = playlistData.nextPageToken;
        } while (nextPageToken);

        console.log(`[${brand.name}] Total videos fetched from YouTube API (after publishedAfter filter): ${allPlaylistItems.length}`);

        if (allPlaylistItems.length === 0) {
          console.log(`[${brand.name}] No new videos found in the official channel's playlist since last scrape or in the last 10 years.`);
          const { error: updateBrandError } = await supabaseClient
            .from('brands')
            .update({ youtube_last_scraped_at: new Date().toISOString() })
            .eq('id', brand.id);
          if (updateBrandError) console.error(`[${brand.name}] Error updating youtube_last_scraped_at:`, updateBrandError.message);
          continue;
        }

        const mediaToInsert = [];
        for (const item of allPlaylistItems) {
            const title = item.snippet.title?.toLowerCase() || '';
            const description = item.snippet.description?.toLowerCase() || '';
            const hasKeyword = SOLAR_KEYWORDS.some((keyword) => title.includes(keyword) || description.includes(keyword));

            if (!hasKeyword) {
                if (DEBUG_MODE) console.log(`[${brand.name}] Filtering out video (no keyword match): "${item.snippet.title}"`);
                continue;
            }

            const videoData = {
                brand_id: brand.id,
                title: item.snippet.title,
                youtube_id: item.snippet.resourceId.videoId,
                full_url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || null,
                platform: 'youtube',
                published_at: item.snippet.publishedAt,
                language: 'en'
            };
            mediaToInsert.push(videoData);
            if (DEBUG_MODE) console.log(`[${brand.name}] Preparing video for insert: ${JSON.stringify(videoData)}`);
        }

        console.log(`[${brand.name}] Videos relevant to solar keywords: ${mediaToInsert.length}`);

        if (mediaToInsert.length === 0) {
          console.log(`[${brand.name}] Found ${allPlaylistItems.length} videos, but none were relevant to solar keywords.`);
          const { error: updateBrandError } = await supabaseClient
            .from('brands')
            .update({ youtube_last_scraped_at: new Date().toISOString() })
            .eq('id', brand.id);
          if (updateBrandError) console.error(`[${brand.name}] Error updating youtube_last_scraped_at:`, updateBrandError.message);
          continue;
        }

        console.log(`[${brand.name}] Attempting to insert ${mediaToInsert.length} videos into 'media' table.`);

        const { error: upsertError } = await supabaseClient.from('media').upsert(mediaToInsert, {
          onConflict: 'brand_id,full_url',
          ignoreDuplicates: true
        });

        if (upsertError) {
          console.error(`[${brand.name}] Error upserting into media table:`, upsertError.message);
        } else {
          console.log(`[${brand.name}] Successfully processed ${mediaToInsert.length} relevant videos.`);
        }

        let newLastScrapedAt = new Date().toISOString();
        if (latestVideoPublishedAt) {
            newLastScrapedAt = latestVideoPublishedAt;
        }

        const { error: updateBrandError } = await supabaseClient
          .from('brands')
          .update({ youtube_last_scraped_at: newLastScrapedAt })
          .eq('id', brand.id);

        if (updateBrandError) {
          console.error(`[${brand.name}] Error updating youtube_last_scraped_at:`, updateBrandError.message);
        } else {
          console.log(`[${brand.name}] Updated youtube_last_scraped_at to: ${newLastScrapedAt}`);
        }

      } catch (e: any) {
        console.error(`[${brand.name}] Error processing YouTube channel:`, e.message);
      }
    }

    console.log("YouTube video batch scraping task completed.");

    return new Response(JSON.stringify({
      message: `YouTube video scraping task completed for ${brandsToProcess.length} brands.`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('A critical error occurred in the Edge Function:', error.message);
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
