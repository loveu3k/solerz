import React, { useState, useEffect, useMemo, SyntheticEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertTriangle, Award, Building, Globe, Mail, MapPin, Newspaper, Phone, User, Video, Bookmark, Loader2, Youtube, MessageCircle, Facebook, Twitter, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import SalesRepNameCardPopup from "./SalesRepNameCardPopup";

// Interfaces remain the same...
interface NewsArticle {
  id: string;
  title: string | null;
  full_content_url: string;
  source: string | null;
  published_at: string | null;
  language: string | null;
}

interface SalesRep {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  countries: string[] | null;
  avatar_url: string | null;
  social_links: {
    whatsapp?: string;
    wechat?: string;
    facebook?: string;
    twitter?: string;
  } | null;
}

interface VideoData {
  id: string;
  title: string | null;
  youtube_id: string | null;
  full_url: string;
  thumbnail_url: string | null;
  platform: string | null;
  published_at: string | null;
  language: string | null;
}

interface Certification {
  id: string;
  name: string;
  authority: string;
  year: string;
  url:string;
}

interface ProfileData {
  summary: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  social_links: { website?: string } | null;
}

interface SellerInfoPopupProps {
  seller: {
    id: string;
    username: string;
    avatar_url?: string;
    error?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


const NEWS_PAGE_SIZE = 5;
const MEDIA_PAGE_SIZE = 10;

const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const SellerInfoPopup: React.FC<SellerInfoPopupProps> = ({
  seller,
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsCount, setNewsCount] = useState(0);
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [isContactFavorited, setIsContactFavorited] = useState<{ [key: string]: boolean }>({});
  const [isLoadingContactFavorite, setIsLoadingContactFavorite] = useState<{ [key: string]: boolean }>({});
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [currentMediaPage, setCurrentMediaPage] = useState(1);
  const [mediaCount, setMediaCount] = useState(0);


  const availableCountries = useMemo(() => {
    const allCountries = salesReps.flatMap(rep =>
      Array.isArray(rep.countries) ? rep.countries : []
    );
    return [...new Set(allCountries)].sort();
  }, [salesReps]);

  useEffect(() => {
    if (open && seller?.id) {
        setCurrentPage(1);
        setCurrentMediaPage(1);

      const fetchInitialData = async () => {
        setIsLoading(true);
        setSelectedCountries([]);
        setPlayingVideoId(null); 
        try {
          const { data: brandData, error: brandError } = await supabase
            .from('brands')
            .select('summary, contact_phone, contact_email, social_links, certifications')
            .eq('id', seller.id)
            .single();
          if (brandError) throw brandError;
          setProfileData({
            summary: brandData.summary,
            contact_phone: brandData.contact_phone,
            contact_email: brandData.contact_email,
            social_links: brandData.social_links,
          });
          setCertifications((brandData.certifications as Certification[]) || []);

          const { data: repsData, error: repsError } = await supabase
            .from('sales_representatives')
            .select('id, name, title, email, phone, countries, avatar_url, social_links')
            .eq('brand_id', seller.id);
          if (repsError) throw repsError;
          const fetchedReps = repsData || [];
          setSalesReps(fetchedReps);

          if (user && fetchedReps.length > 0) {
            const repIds = fetchedReps.map(rep => rep.id);
            const { data: favoritesData, error: favoritesError } = await supabase
              .from('favorites')
              .select('item_id')
              .eq('user_id', user.id)
              .eq('type', 'contact')
              .in('item_id', repIds);
            if (favoritesError) {
              console.error("Error fetching contact favorites:", favoritesError);
            } else {
              const favoritedIds = new Set(favoritesData.map(fav => fav.item_id));
              const favoritedStatus = fetchedReps.reduce((acc, rep) => {
                acc[rep.id] = favoritedIds.has(rep.id);
                return acc;
              }, {} as { [key: string]: boolean });
              setIsContactFavorited(favoritedStatus);
            }
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
          toast({ title: "Error", description: "Could not load brand details.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialData();
    }
  }, [open, seller?.id, toast, user]);

  useEffect(() => {
    if (open && seller?.id) {
      const fetchNewsForPage = async () => {
        setIsLoadingNews(true);
        const from = (currentPage - 1) * NEWS_PAGE_SIZE;
        const to = from + NEWS_PAGE_SIZE - 1;
        try {
          const { count, error: countError } = await supabase
            .from('news')
            .select('id', { count: 'exact', head: true })
            .eq('brand_id', seller.id);
          if (countError) throw countError;
          setNewsCount(count ?? 0);

          const { data, error: dataError } = await supabase
            .from('news')
            .select('id, title, full_content_url, source, published_at, language')
            .eq('brand_id', seller.id)
            .order('published_at', { ascending: false })
            .range(from, to);
          if (dataError) throw dataError;
          setNews(data as NewsArticle[]);
        } catch (error) {
          console.error("Error fetching news:", error);
          setNews([]);
        } finally {
          setIsLoadingNews(false);
        }
      };
      fetchNewsForPage();
    }
  }, [open, seller?.id, currentPage]);
  
  useEffect(() => {
    if (open && seller?.id) {
      const fetchMediaForPage = async () => {
        setIsLoadingMedia(true);
        setPlayingVideoId(null); 
        
        try {
            if (currentMediaPage === 1) {
                const { count, error: countError } = await supabase
                    .from('media')
                    .select('id', { count: 'exact', head: true })
                    .eq('brand_id', seller.id);
                if (countError) throw countError;
                setMediaCount(count ?? 0);
            }

            const from = (currentMediaPage - 1) * MEDIA_PAGE_SIZE;
            const to = from + MEDIA_PAGE_SIZE - 1;
            const { data, error } = await supabase
                .from('media')
                .select('id, title, youtube_id, full_url, thumbnail_url, platform, published_at, language')
                .eq('brand_id', seller.id)
                .order('published_at', { ascending: false })
                .range(from, to);
            
            if (error) throw error;
            setVideos(data || []);

        } catch (error) {
            console.error("Error fetching media:", error);
            setVideos([]);
            toast({ title: "Error", description: "Could not fetch videos.", variant: "destructive" });
        } finally {
            setIsLoadingMedia(false);
        }
      };
      fetchMediaForPage();
    }
  }, [open, seller?.id, currentMediaPage, toast]);

  useEffect(() => {
    if (open && user && seller?.username) {
      setIsLoadingFavorite(true);
      supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', seller.username)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.error("Error checking favorite:", error);
          else setIsFavorited(!!data);
          setIsLoadingFavorite(false);
        });
    }
  }, [open, user, seller?.username]);

  const handleToggleFavorite = async () => {
    if (!user || !seller?.username) return;
    setIsLoadingFavorite(true);
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', seller.username);
        if (error) throw error;
        setIsFavorited(false);
        toast({ title: "Success", description: "Brand removed from favorites." });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              type: 'brand',
              item_id: seller.username,
              item_details: {
                id: seller.id,
                username: seller.username,
                avatar_url: seller.avatar_url,
                social_links: profileData?.social_links
              },
            },
          ]);
        if (error) throw error;
        setIsFavorited(true);
        toast({ title: "Success", description: "Brand added to favorites." });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({ title: "Error", description: "Failed to update favorites.", variant: "destructive" });
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleToggleContactFavorite = async (contact: SalesRep) => {
    if (!user || !seller) {
      toast({ title: "Please log in to save contacts." });
      return;
    }

    const contactId = contact.id;
    const isCurrentlyFavorited = isContactFavorited[contactId];

    setIsLoadingContactFavorite(prev => ({ ...prev, [contactId]: true }));

    try {
      if (isCurrentlyFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', contactId)
          .eq('type', 'contact');
        if (error) throw error;
        setIsContactFavorited(prev => ({ ...prev, [contactId]: false }));
        toast({ title: "Success", description: "Contact removed from favorites." });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            type: 'contact',
            item_id: contactId,
            item_details: { ...contact, brand_id: seller.id }
          }]);
        if (error) throw error;
        setIsContactFavorited(prev => ({ ...prev, [contactId]: true }));
        toast({ title: "Success", description: "Contact added to favorites." });
      }
    } catch (error) {
      console.error("Error toggling contact favorite:", error);
      toast({ title: "Error", description: "Failed to update favorites.", variant: "destructive" });
    } finally {
      setIsLoadingContactFavorite(prev => ({ ...prev, [contactId]: false }));
    }
  };
  
  const handleVideoError = (e: SyntheticEvent<HTMLVideoElement, Event>, videoUrl: string | null) => {
    console.error("Video Error:", e);
    toast({
        title: "Video Error",
        description: `Could not load video. Please check the URL: ${videoUrl}`,
        variant: "destructive"
    });
    setPlayingVideoId(null);
  };

  const totalNewsPages = Math.ceil(newsCount / NEWS_PAGE_SIZE);
  const totalMediaPages = Math.ceil(mediaCount / MEDIA_PAGE_SIZE);

  const filteredSalesReps = useMemo(() => {
    if (selectedCountries.length === 0) {
      return salesReps;
    }
    return salesReps.filter(rep =>
      Array.isArray(rep.countries) &&
      selectedCountries.some(country => rep.countries.includes(country))
    );
  }, [salesReps, selectedCountries]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl p-0 bg-white dark:bg-gray-900" aria-describedby={undefined}>
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-amber-100 dark:border-gray-700">
                  <AvatarImage src={seller?.avatar_url} alt={seller?.username} />
                  <AvatarFallback className="bg-amber-100 dark:bg-gray-800 text-amber-800 dark:text-gray-200">{seller?.username?.charAt(0).toUpperCase() || "B"}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{seller?.username}</DialogTitle>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Brand Profile</p>
                </div>
              </div>
              {!seller?.error && user && (
                <Button variant="ghost" size="icon" onClick={handleToggleFavorite} disabled={isLoadingFavorite} title="Save brand">
                  <Bookmark className={`w-6 h-6 transition-colors ${isFavorited ? 'text-amber-500 fill-current' : 'text-gray-400 hover:text-amber-400'}`} />
                </Button>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted dark:bg-gray-800/50 rounded-none">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="media" onClick={() => setPlayingVideoId(null)}>Media</TabsTrigger>
              <TabsTrigger value="contacts">Sales Contacts</TabsTrigger>
            </TabsList>

            <div className="p-6 h-[60vh] overflow-y-auto">
              <TabsContent value="profile">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : !profileData ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto mb-2" />
                    Profile could not be loaded.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Building size={16} /> Summary
                      </h4>
                      <p className="text-sm text-muted-foreground">{profileData.summary || "No summary provided."}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      {profileData.contact_phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size= {14} />
                          <a href={`tel:${profileData.contact_phone}`} className="text-amber-500 hover:underline">{profileData.contact_phone}</a>
                        </div>
                      )}
                      {profileData.contact_email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail size={14} />
                          <a href={`mailto:${profileData.contact_email}`} className="text-amber-500 hover:underline">{profileData.contact_email}</a>
                        </div>
                      )}
                      {profileData.social_links?.website && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe size={14} />
                          <a href={profileData.social_links.website} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Visit Website</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="news">
                {isLoadingNews ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {news.length > 0 ? (
                        news.map((item) => (
                          <div key={item.id} className="p-3 rounded-lg border dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                            <div>
                              <p className="text-xs text-muted-foreground">{item.source}</p>
                              <button
                                onClick={() => window.open(item.full_content_url, '_blank')}
                                className="font-semibold text-base leading-tight hover:underline line-clamp-2 text-left"
                              >
                                {item.title}
                              </button>
                              <p className="text-xs text-muted-foreground mt-1">{item.published_at ? timeAgo(new Date(item.published_at)) : ''}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Newspaper size={32} className="mx-auto mb-2" />
                          No news available.
                        </div>
                      )}
                    </div>
                    {totalNewsPages > 1 && (
                      <div className="flex items-center justify-between pt-6">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</Button>
                        <span className="text-sm text-muted-foreground">Page {currentPage} of {totalNewsPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalNewsPages}>Next</Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="media">
                {isLoadingMedia ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : videos.length > 0 ? (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video) => (
                        <div
                          key={video.id}
                          className="border dark:border-gray-800 rounded-lg overflow-hidden shadow-sm"
                        >
                          <div className="aspect-video bg-black relative group">
                            {playingVideoId === video.id ? (
                              video.platform === 'youtube' && video.youtube_id ? (
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&mute=1`}
                                  title={video.title || "Video"}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  width="100%"
                                  height="100%"
                                  controls
                                  autoPlay
                                  muted 
                                  poster={video.thumbnail_url || ''}
                                  className="w-full h-full object-cover"
                                  onEnded={() => setPlayingVideoId(null)}
                                  onError={(e) => handleVideoError(e, video.full_url)}
                                >
                                  <source src={video.full_url} />
                                  Your browser does not support the video tag.
                                </video>
                              )
                            ) : (
                              <>
                                {video.thumbnail_url ? (
                                  <img
                                    src={video.thumbnail_url}
                                    alt={video.title || 'Video thumbnail'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                    <Video className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                                <button
                                  onClick={() => setPlayingVideoId(video.id)}
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  aria-label={`Play video: ${video.title}`}
                                >
                                  <Youtube className="w-16 h-16 text-white drop-shadow-lg" />
                                </button>
                              </>
                            )}
                          </div>
                          <p className="p-3 text-sm font-medium text-foreground dark:text-gray-200 line-clamp-2">
                            {video.title || "Untitled Video"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                  {totalMediaPages > 1 && (
                      <div className="flex items-center justify-between pt-6">
                        <Button variant="outline" size="sm" onClick={() => setCurrentMediaPage(p => p - 1)} disabled={currentMediaPage === 1}>Previous</Button>
                        <span className="text-sm text-muted-foreground">Page {currentMediaPage} of {totalMediaPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMediaPage(p => p + 1)} disabled={currentMediaPage === totalMediaPages}>Next</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Youtube size={32} className="mx-auto mb-2" />
                    No media available for this brand.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contacts">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : salesReps.length > 0 ? (
                  <>
                    <div className="flex justify-end mb-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={availableCountries.length === 0}>
                            <Filter className="mr-2 h-4 w-4" />
                            Filter by Country
                            {selectedCountries.length > 0 && ` (${selectedCountries.length})`}
                          </Button>
                        </DropdownMenuTrigger>
                        {/* THIS IS THE LINE TO BE MODIFIED */}
                        <DropdownMenuContent className="w-56 max-h-72 overflow-y-auto bg-background/80 backdrop-blur-sm">
                          <DropdownMenuLabel>
                            <div className="flex justify-between items-center">
                              <span>Countries</span>
                              {selectedCountries.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto px-2 py-1"
                                  onClick={() => setSelectedCountries([])}
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {availableCountries.map(country => (
                            <DropdownMenuCheckboxItem
                              key={country}
                              checked={selectedCountries.includes(country)}
                              onCheckedChange={(checked) => {
                                setSelectedCountries(prev =>
                                  checked
                                    ? [...prev, country]
                                    : prev.filter(c => c !== country)
                                );
                              }}
                            >
                              {country}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-4">
                      {filteredSalesReps.map((contact) => (
                        <div key={contact.id} className="p-3 rounded-lg border flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-grow">
                            <Avatar className="mt-1">
                              <AvatarImage src={contact.avatar_url || ''} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h5 className="font-semibold">
                                <button
                                  onClick={() => setSelectedRep(contact)}
                                  className="hover:underline text-amber-500"
                                >
                                  {contact.name}
                                </button>
                                <span className="text-sm font-normal text-muted-foreground"> {contact.title}</span>
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                <MapPin size={12} className="inline mr-1" />
                                {Array.isArray(contact.countries) ? contact.countries.join(', ') : 'N/A'}
                              </p>
                              <div className="text-xs mt-2 space-y-1">
                                {contact.email && (
                                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:underline">
                                    <Mail size={12} />
                                    {contact.email}
                                  </a>
                                )}
                                {contact.phone && (
                                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:underline">
                                    <Phone size={12} />
                                    {contact.phone}
                                  </a>
                                )}
                                {contact.social_links && (
                                  <div className="flex gap-2 mt-2">
                                    {contact.social_links.whatsapp && (
                                      <a href={contact.social_links.whatsapp} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">
                                        <MessageCircle size={16} title="WhatsApp" />
                                      </a>
                                    )}
                                    {contact.social_links.wechat && (
                                      <a href={contact.social_links.wechat} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">
                                        <MessageCircle size={16} title="WeChat" />
                                      </a>
                                    )}
                                    {contact.social_links.facebook && (
                                      <a href={contact.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">
                                        <Facebook size={16} title="Facebook" />
                                      </a>
                                    )}
                                    {contact.social_links.twitter && (
                                      <a href={contact.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">
                                        <Twitter size={16} title="Twitter" />
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {user && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleContactFavorite(contact)}
                              disabled={isLoadingContactFavorite[contact.id]}
                              title="Save contact"
                              className="flex-shrink-0"
                            >
                              {isLoadingContactFavorite[contact.id] ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Bookmark className={`w-5 h-5 transition-colors ${isContactFavorited[contact.id] ? 'text-amber-500 fill-current' : 'text-gray-400 hover:text-amber-400'}`} />
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User size={32} className="mx-auto mb-2" />
                    No sales contacts listed.
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {selectedRep && (
        <SalesRepNameCardPopup
          rep={selectedRep}
          open={!!selectedRep}
          onOpenChange={(isOpen) => { if (!isOpen) setSelectedRep(null); }}
        />
      )}
    </>
  );
};

export default SellerInfoPopup;
