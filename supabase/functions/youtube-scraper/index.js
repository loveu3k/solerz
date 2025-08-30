require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// ✅ Supabase credentials
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ YouTube API Key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// ✅ Function: Fetch all brands
async function fetchBrands() {
  const { data, error } = await supabase.from('brands').select('id, name');

  if (error) {
    console.error('❌ Error fetching brands:', error.message);
    process.exit(1);
  }

  console.log(`✅ Fetched ${data.length} brands.`);
  return data;
}

// ✅ Function: Search YouTube for a brand
async function fetchYouTubeVideos(brandName) {
  const query = `${brandName} official`;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;

  try {
    const res = await axios.get(url);
    const items = res.data.items || [];

    return items.map((item) => ({
      youtube_id: item.id.videoId,
      title: item.snippet.title,
      full_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail_url: item.snippet.thumbnails?.high?.url || null,
      published_at: item.snippet.publishedAt,
      platform: 'youtube',
      language: 'en',
    }));
  } catch (error) {
    console.error(`❌ YouTube API error for ${brandName}:`, error.message);
    return [];
  }
}

// ✅ Function: Upload videos to Supabase
async function uploadToSupabase(brand_id, videos) {
  if (videos.length === 0) {
    console.log(`⚠️ No videos to upload for brand ${brand_id}`);
    return;
  }

  const enrichedVideos = videos.map((v) => ({
    ...v,
    brand_id,
  }));

  const { error } = await supabase
    .from('media')
    .upsert(enrichedVideos, { onConflict: 'brand_id,full_url' });

  if (error) {
    console.error('❌ Upload error:', error.message);
  } else {
    console.log(`✅ Uploaded ${enrichedVideos.length} videos for brand ${brand_id}`);
  }
}

// ✅ Main process
(async () => {
  const brands = await fetchBrands();

  for (const brand of brands) {
    console.log(`🔍 Searching videos for "${brand.name}"...`);
    const videos = await fetchYouTubeVideos(brand.name);
    await uploadToSupabase(brand.id, videos);
  }

  console.log('🎉 All done!');
})();
