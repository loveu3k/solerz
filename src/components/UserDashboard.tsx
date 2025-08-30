import React, { useState, useEffect, Suspense, lazy, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Upload, Save, Trash2, Edit, Loader2, Settings, Bookmark, PlusCircle, X, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { ALL_COUNTRIES } from "@/lib/countries";
import axios from "axios";
import { format } from 'date-fns';

const SellerInfoPopup = lazy(() => import("@/components/SellerInfoPopup"));
const SalesRepNameCardPopup = lazy(() => import("@/components/SalesRepNameCardPopup"));

// Columns for Saved Products
const PRODUCT_COLUMNS = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "type", label: "Type" },
  { key: "power", label: "Power" },
];

// Columns for Saved Brands
const BRAND_COLUMNS = [
  { key: "logo_url", label: "Logo" },
  { key: "name", label: "Name" },
  { key: "website", label: "Website" },
];

// Columns for Saved Contacts
const CONTACT_COLUMNS = [
  { key: "avatar_url", label: "Avatar" },
  { key: "name", label: "Name" },
  { key: "brand", label: "Brand" },
  { key: "title", label: "Title" },
  { key: "email", label: "Email" },
];

interface Favorite {
  id: string;
  user_id: string;
  type: "product" | "brand" | "contact";
  item_id: string;
  item_details: any;
}

interface SalesRep {
  id: string;
  brand_id: string;
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

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  summary: string | null;
  contact_phone: string | null;
  contact_plan: string | null;
  contact_email: string | null;
  social_links: { website?: string } | null;
}

interface ContactWithBrand extends Favorite {
  brand_name: string | null;
}

const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase();
};

const UserDashboard = () => {
  const { user, loading: authLoading, updateProfile, checkUser } = useAuth(); // <-- AMENDED: get checkUser
  const { toast } = useToast();
  const navigate = useNavigate();
  const repFormRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Favorite[]>([]);
  const [brands, setBrands] = useState<Favorite[]>([]);
  const [contacts, setContacts] = useState<ContactWithBrand[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [isRepDialogOpen, setIsRepDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isSellerPopupOpen, setIsSellerPopupOpen] = useState(false);
  const [selectedSellerInfo, setSelectedSellerInfo] = useState(null);
  const [isSellerInfoLoading, setIsSellerInfoLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [repForm, setRepForm] = useState({
    id: "",
    name: "",
    title: "",
    email: "",
    phone: "",
    countries: [] as string[],
    avatarFile: null as File | null,
    whatsapp: "",
    wechat: "",
    facebook: "",
    twitter: "",
  });
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    phone: "",
    website: "",
    avatarFile: null as File | null,
    avatar_url: ""
  });
  const [brandForm, setBrandForm] = useState({
    name: "",
    summary: "",
    contact_phone: "",
    contact_email: "",
    website: "",
  });
  const [countrySearch, setCountrySearch] = useState("");

  const isPro = user?.tier === "pro";

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id);

        if (favoritesError) throw favoritesError;
        setProducts(favoritesData.filter(f => f.type === "product") || []);
        setBrands(favoritesData.filter(f => f.type === "brand") || []);

        const contactFavorites = favoritesData.filter(f => f.type === "contact") || [];
        const contactWithBrands: ContactWithBrand[] = [];
        for (const fav of contactFavorites) {
          const repBrandId = fav.item_details?.brand_id;
          if (repBrandId) {
            const { data: brandData, error: brandError } = await supabase
              .from("brands")
              .select("name")
              .eq("id", repBrandId)
              .single();
            contactWithBrands.push({
              ...fav,
              brand_name: brandError || !brandData ? "N/A" : brandData.name,
            });
          } else {
            contactWithBrands.push({ ...fav, brand_name: "N/A" });
          }
        }
        setContacts(contactWithBrands);

        if (isPro && user.brand_id) {
          const { data: repsData, error: repsError } = await supabase
            .from("sales_representatives")
            .select("*")
            .eq("brand_id", user.brand_id);
          if (repsError) throw repsError;
          setSalesReps(repsData || []);

          const { data: brandData, error: brandError } = await supabase
            .from("brands")
            .select("id, name, logo_url, summary, contact_phone, contact_email, social_links")
            .eq("id", user.brand_id)
            .single();
          if (!brandError && brandData) {
            setSelectedBrand(brandData);
            setBrandForm({
              name: brandData.name || "",
              summary: brandData.summary || "",
              contact_phone: brandData.contact_phone || "",
              contact_email: brandData.contact_email || "",
              website: brandData.social_links?.website || "",
            });
          }
        }

        setFormData({
          username: user.username || "",
          bio: user.bio || "",
          phone: user.phone || "",
          website: user.website || "",
          avatarFile: null,
          avatar_url: user.avatar_url || ""
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, isPro, toast, navigate]);

  const handleToggleFavorite = async (item, type: "product" | "brand" | "contact") => {
    if (!user) {
      toast({
        title: "Registration Required",
        description: "Please create an account to save items.",
        variant: "destructive",
        duration: 3000,
      });
      navigate("/register");
      return;
    }

    const { id, name, model, username } = item;
    const itemId = type === 'brand' ? username : id;

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .eq("type", type);

      if (error) throw error;

      if (type === "product") {
        setProducts(products.filter(p => p.item_id !== itemId));
        toast({ title: "Removed", description: `${model || "Product"} removed from saved items.`, duration: 2000 });
      } else if (type === "brand") {
        setBrands(brands.filter(b => b.item_id !== itemId));
        toast({ title: "Removed", description: `${name || username || "Brand"} removed from saved brands.`, duration: 2000 });
      } else if (type === "contact") {
        setContacts(contacts.filter(c => c.item_id !== itemId));
        toast({ title: "Removed", description: `${name || "Contact"} removed from saved contacts.`, duration: 2000 });
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast({
        title: "Error",
        description: "Could not remove item. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleBrandClick = async (brandName) => {
    if (!user) {
      navigate("/register");
      return;
    }

    if (!brandName || brandName === "N/A") return;

    const trimmedBrandName = brandName.trim();
    if (!trimmedBrandName) return;

    setIsSellerInfoLoading(true);
    setIsSellerPopupOpen(true);
    setSelectedSellerInfo({ username: trimmedBrandName });

    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, logo_url")
        .ilike("name", trimmedBrandName)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("Brand profile not found in the database.");
      }

      const mappedData = {
        id: data.id,
        username: data.name,
        avatar_url: data.logo_url,
      };

      setSelectedSellerInfo(mappedData);
    } catch (error) {
      console.error("Error fetching brand details:", error);
      setSelectedSellerInfo({
        username: trimmedBrandName,
        error: "Could not load brand profile.",
      });
    } finally {
      setIsSellerInfoLoading(false);
    }
  };

  const handleRepInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRepForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCountrySelect = (country: string) => {
    setRepForm(prev => {
      const currentCountries = Array.isArray(prev.countries) ? prev.countries : [];
      const newCountries = currentCountries.includes(country)
        ? currentCountries.filter(c => c !== country)
        : [...currentCountries, country];
      return { ...prev, countries: newCountries };
    });
  };

  const handleRepAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Avatar file size exceeds 5MB.", variant: "destructive" });
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast({ title: "Error", description: "Only JPEG or PNG files are allowed.", variant: "destructive" });
        return;
      }
      setRepForm(prev => ({ ...prev, avatarFile: file }));
    }
  };

  const uploadRepAvatar = async (brandName: string, repName: string) => {
    if (!repForm.avatarFile) return null;
    try {
      const fileExt = repForm.avatarFile.name.split(".").pop();
      const sanitizedBrandName = sanitizeFilename(brandName);
      const sanitizedRepName = sanitizeFilename(repName);
      const filePath = `${sanitizedBrandName}/${sanitizedRepName}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, repForm.avatarFile, { upsert: true });

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading rep avatar:", error);
      toast({ title: "Error", description: "Failed to upload avatar.", variant: "destructive" });
      return null;
    }
  };

  const handleRepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro || !user?.brand_id || !selectedBrand) {
      toast({ title: "Error", description: "Brand not found or not authorized.", variant: "destructive" });
      return;
    }

    try {
      const avatar_url = await uploadRepAvatar(selectedBrand.name, repForm.name);
      const social_links = {
        whatsapp: repForm.whatsapp || undefined,
        wechat: repForm.wechat || undefined,
        facebook: repForm.facebook || undefined,
        twitter: repForm.twitter || undefined,
      };

      const repData: Partial<SalesRep> & { social_links: any } = {
        name: repForm.name,
        title: repForm.title || null,
        email: repForm.email || null,
        phone: repForm.phone || null,
        countries: repForm.countries.length > 0 ? repForm.countries : null,
        social_links,
      };

      if (avatar_url) {
        repData.avatar_url = avatar_url;
      }

      if (repForm.id) {
        const { error } = await supabase
          .from("sales_representatives")
          .update(repData)
          .eq("id", repForm.id)
          .eq("brand_id", user.brand_id);
        if (error) throw error;
        toast({ title: "Success", description: "Sales representative updated." });
      } else {
        const { error } = await supabase
          .from("sales_representatives")
          .insert([{ ...repData, brand_id: user.brand_id }])
          .select();
        if (error) throw error;
        toast({ title: "Success", description: "Sales representative added." });
      }

      const { data: repsData, error: repsError } = await supabase
        .from("sales_representatives")
        .select("*")
        .eq("brand_id", user.brand_id);
      if (repsError) throw repsError;
      setSalesReps(repsData || []);
      setIsRepDialogOpen(false);
    } catch (error) {
      console.error("Error saving rep:", error);
      toast({ title: "Error", description: "Failed to save sales representative.", variant: "destructive" });
    }
  };

  const handleDeleteRep = async (repId: string) => {
    if (!isPro || !user?.brand_id) return;
    try {
      const repToDelete = salesReps.find(r => r.id === repId);
      if (repToDelete?.avatar_url) {
        const url = new URL(repToDelete.avatar_url);
        const filePath = url.pathname.split(`/avatars/`)[1];

        if (filePath) {
          await supabase.storage.from("avatars").remove([filePath]);
        }
      }
      const { error } = await supabase
        .from("sales_representatives")
        .delete()
        .eq("id", repId)
        .eq("brand_id", user.brand_id);
      if (error) throw error;
      setSalesReps(salesReps.filter(rep => rep.id !== repId));
      toast({ title: "Success", description: "Sales representative deleted." });
    } catch (error) {
      console.error("Error deleting rep:", error);
      toast({ title: "Error", description: "Failed to delete sales representative.", variant: "destructive" });
    }
  };

  const handleSettingsInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Avatar file size exceeds 5MB.", variant: "destructive" });
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast({ title: "Error", description: "Only JPEG or PNG files are allowed.", variant: "destructive" });
        return;
      }
      setFormData(prev => ({ ...prev, avatarFile: file }));
    }
  };

  const uploadSettingsAvatar = async () => {
    if (!formData.avatarFile) return formData.avatar_url || null;
    try {
      const fileExt = formData.avatarFile.name.split(".").pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, formData.avatarFile, { upsert: true });

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({ title: "Error", description: "Failed to upload avatar.", variant: "destructive" });
      return null;
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) {
      navigate("/pricing");
      return;
    }
    try {
      const avatar_url = await uploadSettingsAvatar();
      const updateData = {
        bio: formData.bio || null,
        phone: formData.phone || null,
        website: formData.website || null,
        avatar_url,
      };
      const { error } = await updateProfile(updateData);
      if (error) throw new Error(error.message);

      toast({ title: "Success", description: "Profile updated successfully." });
      setIsSettingsDialogOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro || !user?.brand_id) {
      return;
    }
    try {
      const { error } = await supabase.from("brands").update({
        summary: brandForm.summary || null,
        contact_phone: brandForm.contact_phone || null,
        contact_email: brandForm.contact_email || null,
        social_links: brandForm.website ? { website: brandForm.website } : null,
      })
        .eq('id', user.brand_id)

      if (error) throw error;
      toast({ title: "Success", description: "Brand details updated successfully." });
      setIsBrandDialogOpen(false);

      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .select("id, name, logo_url, summary, contact_phone, contact_email, social_links")
        .eq("id", user.brand_id)
        .single();
      if (!brandError && brandData) {
        setSelectedBrand(brandData);
      }

    } catch (error) {
      console.error("Error saving brand details:", error);
      toast({ title: "Error", description: "Failed to save brand details.", variant: "destructive" });
    }
  };

  const handleBrandInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBrandForm(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmCancellation = async () => {
    if (!user) return;
  
    setIsCanceling(true);
    try {
      await axios.post('/api/cancel-subscription', {
        userId: user.id,
      });
  
      toast({
        title: "Cancellation Scheduled",
        description: "Your subscription will be canceled at the end of your billing period.",
      });
      
      // --- AMENDED ---
      // This now triggers a clean data re-fetch instead of a full page reload.
      await checkUser({ force: true });
  
    } catch (error) {
      console.error("Error scheduling cancellation:", error);
      toast({
        title: "Error",
        description: "Could not schedule cancellation. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto py-10 px-4 text-center pt-20">
          <Loader2 className="h-8 w-8 mx-auto animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-10 px-4 max-w-6xl pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, {user.username || "User"}
          </h1>
          {isPro && (
            <Button
              onClick={() => {
                setFormData({
                  username: user.username || "",
                  bio: user.bio || "",
                  phone: user.phone || "",
                  website: user.website || "",
                  avatarFile: null,
                  avatar_url: user.avatar_url || "",
                });
                setIsSettingsDialogOpen(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Settings className="mr-2 h-4 w-4" /> Profile Settings
            </Button>
          )}
        </div>
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 gap-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-1 mb-6">
            <TabsTrigger
              value="products"
              className="text-sm font-medium py-2 transition-all duration-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              Saved Products
            </TabsTrigger>
            <TabsTrigger
              value="brands"
              className="text-sm font-medium py-2 transition-all duration-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              Saved Brands
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="text-sm font-medium py-2 transition-all duration-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
            >
              Saved Contacts
            </TabsTrigger>
            {isPro && (
              <TabsTrigger
                value="sales-reps"
                className="text-sm font-medium py-2 transition-all duration-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md"
              >
                Sales Representatives
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="products" className="mt-0">
            <Card className="shadow-lg border-none bg-white dark:bg-gray-800 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Saved Products</CardTitle>
                <CardDescription>Your saved products from the marketplace.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-background dark:bg-gray-900 rounded-xl shadow-md border border-border dark:border-gray-800 overflow-x-auto">
                  {products.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground dark:text-gray-400">No saved products.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted dark:bg-gray-800">
                        <tr>
                          {PRODUCT_COLUMNS.map(col => (
                            <th
                              key={col.key}
                              className="p-3 border-b border-border dark:border-gray-800 text-left font-medium min-w-fit whitespace-nowrap"
                            >
                              {col.label}
                            </th>
                          ))}
                          <th className="p-3 border-b border-border dark:border-gray-800 text-left font-medium min-w-fit">PDF</th>
                          <th className="p-3 border-b border-border dark:border-gray-800 text-left font-medium">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(fav => {
                          const product = { ...fav.item_details, id: fav.item_id };
                          return (
                            <tr key={product.id} className="border-b border-border dark:border-gray-800 hover:bg-muted dark:hover:bg-gray-800">
                              {PRODUCT_COLUMNS.map(col => (
                                <td key={col.key} className="p-3">
                                  {col.key === "brand" ? (
                                    <button
                                      onClick={() => handleBrandClick(product.brand)}
                                      className="text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 hover:underline"
                                    >
                                      {product.brand || "N/A"}
                                    </button>
                                  ) : col.key === "type" ? (
                                    product.panel_type?.length > 0 ? product.panel_type.join(", ") :
                                      product.inverter_type || "N/A"
                                  ) : col.key === "power" ? (
                                    product.power_rating_watts || product.max_dc_current || "N/A"
                                  ) : (
                                    product[col.key] || "N/A"
                                  )}
                                </td>
                              ))}
                              <td className="p-3">
                                {product.datasheet_url ? (
                                  <a
                                    href={product.datasheet_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 hover:underline"
                                  >
                                    Link
                                  </a>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="p-3">
                                <button onClick={() => handleToggleFavorite(product, "product")} title="Remove item">
                                  <Bookmark className="w-5 h-5 text-amber-500 fill-current" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brands" className="mt-0">
            <Card className="shadow-lg border-none bg-white dark:bg-gray-800 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Saved Brands</CardTitle>
                <CardDescription>Your saved brands from the marketplace.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-background dark:bg-gray-900 rounded-xl shadow-md border border-border dark:border-gray-800 overflow-x-auto">
                  {brands.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground dark:text-gray-400">No saved brands.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted dark:bg-gray-800">
                        <tr>
                          {BRAND_COLUMNS.map(col => (
                            <th
                              key={col.key}
                              className="p-3 border-b border-border dark:border-gray-800 text-left font-medium min-w-fit whitespace-nowrap"
                            >
                              {col.label}
                            </th>
                          ))}
                          <th className="p-3 border-b border-border dark:border-gray-800 text-left font-medium">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brands.map(fav => {
                          const brand = { ...fav.item_details };
                          return (
                            <tr key={fav.item_id} className="border-b border-border dark:border-gray-800 hover:bg-muted dark:hover:bg-gray-800">
                              {BRAND_COLUMNS.map(col => (
                                <td key={col.key} className="p-3">
                                  {col.key === "logo_url" ? (
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={brand.avatar_url || ""} alt={brand.username || "Brand"} />
                                      <AvatarFallback>{brand.username?.charAt(0) || "B"}</AvatarFallback>
                                    </Avatar>
                                  ) : col.key === "name" ? (
                                    <button
                                      onClick={() => handleBrandClick(brand.username)}
                                      className="text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 hover:underline"
                                    >
                                      {brand.username || "N/A"}
                                    </button>
                                  ) : col.key === "website" ? (
                                    brand.social_links?.website ? (
                                      <a
                                        href={brand.social_links.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 hover:underline"
                                      >
                                        Link
                                      </a>
                                    ) : (
                                      "N/A"
                                    )
                                  ) : (
                                    brand[col.key] || "N/A"
                                  )}
                                </td>
                              ))}
                              <td className="p-3">
                                <button onClick={() => handleToggleFavorite(brand, "brand")} title="Remove brand">
                                  <Bookmark className="w-5 h-5 text-amber-500 fill-current" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <Card className="shadow-lg border-none bg-white dark:bg-gray-800 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Saved Contacts</CardTitle>
                <CardDescription>Your saved sales contacts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-background dark:bg-gray-900 rounded-xl shadow-md border border-border dark:border-gray-800 overflow-x-auto">
                  {contacts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground dark:text-gray-400">No saved contacts.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted dark:bg-gray-800">
                        <tr>
                          {CONTACT_COLUMNS.map(col => (
                            <th
                              key={col.key}
                              className="p-3 border-b border-border dark:border-gray-800 text-left font-medium min-w-fit whitespace-nowrap"
                            >
                              {col.label}
                            </th>
                          ))}
                          <th className="p-3 border-b border-border dark:border-gray-800 text-left font-medium">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map(fav => {
                          const contact = { ...fav.item_details, id: fav.item_id };
                          return (
                            <tr key={contact.id} className="border-b border-border dark:border-gray-800 hover:bg-muted dark:hover:bg-gray-800">
                              {CONTACT_COLUMNS.map(col => (
                                <td key={col.key} className="p-3">
                                  {col.key === "avatar_url" ? (
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={contact.avatar_url || ""} alt={contact.name || "Contact"} />
                                      <AvatarFallback>{contact.name?.charAt(0) || "C"}</AvatarFallback>
                                    </Avatar>
                                  ) : col.key === "name" ? (
                                    <button
                                      onClick={() => setSelectedRep(contact)}
                                      className="text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 hover:underline"
                                    >
                                      {contact.name || "N/A"}
                                    </button>
                                  ) : col.key === "brand" ? (
                                    fav.brand_name || "N/A"
                                  ) : (
                                    contact[col.key] || "N/A"
                                  )}
                                </td>
                              ))}
                              <td className="p-3">
                                <button onClick={() => handleToggleFavorite(contact, "contact")} title="Remove contact">
                                  <Bookmark className="w-5 h-5 text-amber-500 fill-current" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isPro && (
            <TabsContent value="sales-reps" className="mt-0">
              <Card className="shadow-lg border-none bg-white dark:bg-gray-800 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Sales Representatives</CardTitle>
                    <CardDescription>Manage your sales team.</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setRepForm({
                        id: "", name: "", title: "", email: "", phone: "",
                        countries: [], avatarFile: null, whatsapp: "", wechat: "",
                        facebook: "", twitter: "",
                      });
                      setCountrySearch(""); // Reset search
                      setIsRepDialogOpen(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                    disabled={!selectedBrand}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Representative
                  </Button>
                </CardHeader>
                <CardContent>
                  {(() => {
                    if (!user.brand_id) {
                      return (
                        <p className="text-center text-muted-foreground py-8">
                          You have not been assigned to a brand. Please contact an administrator.
                        </p>
                      );
                    }
                    if (!selectedBrand) {
                      return (
                        <p className="text-center text-destructive py-8">
                          Could not load your brand details. Please refresh or contact support if the problem persists.
                        </p>
                      );
                    }
                    if (salesReps.length > 0) {
                      return (
                        <div className="space-y-4">
                          {salesReps.map(rep => (
                            <div
                              key={rep.id}
                              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={rep.avatar_url || ""} alt={rep.name} />
                                  <AvatarFallback>{rep.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <Button
                                    variant="link"
                                    onClick={() => setSelectedRep(rep)}
                                    className="text-lg font-medium text-orange-500 hover:underline p-0 h-auto"
                                  >
                                    {rep.name}
                                  </Button>
                                  <p className="text-sm text-muted-foreground">{rep.title || "N/A"}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRepForm({
                                      id: rep.id,
                                      name: rep.name,
                                      title: rep.title || "",
                                      email: rep.email || "",
                                      phone: rep.phone || "",
                                      countries: Array.isArray(rep.countries) ? rep.countries : [],
                                      avatarFile: null,
                                      whatsapp: rep.social_links?.whatsapp || "",
                                      wechat: rep.social_links?.wechat || "",
                                      facebook: rep.social_links?.facebook || "",
                                      twitter: rep.social_links?.twitter || "",
                                    });
                                    setCountrySearch(""); // Reset search
                                    setIsRepDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteRep(rep.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <p className="text-center text-muted-foreground py-8">No sales representatives added yet. Click 'Add Representative' to begin.</p>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <Dialog open={isRepDialogOpen} onOpenChange={setIsRepDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 flex flex-col p-0">
            <DialogHeader className="flex-none flex flex-row justify-between items-center space-y-0 sticky top-0 bg-white dark:bg-gray-800 py-4 px-6 border-b dark:border-gray-700 z-10">
              <div>
                <DialogTitle className="text-xl font-semibold">{repForm.id ? "Edit Representative" : "Add Representative"}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Fill in the details for the sales representative. Click save when you're done.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => repFormRef.current?.requestSubmit()} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-5 w-5 text-gray-400 hover:text-white" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="overflow-y-auto flex-grow px-6 pb-6">
              <form ref={repFormRef} onSubmit={handleRepSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={repForm.name} onChange={handleRepInputChange} required className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={repForm.title} onChange={handleRepInputChange} className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={repForm.email} onChange={handleRepInputChange} className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={repForm.phone} onChange={handleRepInputChange} className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="countrySearch">Countries</Label>
                    <Input
                      id="countrySearch"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search countries..."
                      className="border-gray-300 dark:border-gray-600 mb-2"
                    />
                    <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                      {ALL_COUNTRIES.filter(country =>
                        country.toLowerCase().includes(countrySearch.toLowerCase())
                      ).map((country) => (
                        <div key={country} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id={`country-${country}`}
                            checked={repForm.countries.includes(country)}
                            onChange={() => handleCountrySelect(country)}
                            className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <label htmlFor={`country-${country}`} className="text-sm text-gray-700 dark:text-gray-300">
                            {country}
                          </label>
                        </div>
                      ))}
                      {ALL_COUNTRIES.filter(country =>
                        country.toLowerCase().includes(countrySearch.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-2">
                          No countries found.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="avatar">Avatar</Label>
                    <Input id="avatar" type="file" accept="image/jpeg,image/png" onChange={handleRepAvatarChange} className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <h3 className="md:col-span-2 font-medium text-gray-700 dark:text-gray-300 pt-4 border-t dark:border-gray-700">Social Links (Optional)</h3>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" name="whatsapp" value={repForm.whatsapp} onChange={handleRepInputChange} placeholder="https://wa.me/..." className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="wechat">WeChat</Label>
                    <Input id="wechat" name="wechat" value={repForm.wechat} onChange={handleRepInputChange} placeholder="WeChat ID or URL" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" name="facebook" value={repForm.facebook} onChange={handleRepInputChange} placeholder="https://facebook.com/..." className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input id="twitter" name="twitter" value={repForm.twitter} onChange={handleRepInputChange} placeholder="https://twitter.com/..." className="border-gray-300 dark:border-gray-600" />
                  </div>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Brand Details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input id="name" name="name" value={brandForm.name} required disabled className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" name="summary" value={brandForm.summary} onChange={handleBrandInputChange} className="border-gray-300 dark:border-gray-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input id="contact_phone" name="contact_phone" value={brandForm.contact_phone} onChange={handleBrandInputChange} className="border-gray-300 dark:border-gray-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" value={brandForm.contact_email} onChange={handleBrandInputChange} className="border-gray-300 dark:border-gray-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={brandForm.website} onChange={handleBrandInputChange} placeholder="https://your-brand.com" className="border-gray-300 dark:border-gray-600" />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isPro && (
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 p-0 flex flex-col max-h-[90vh]">
              <DialogHeader className="p-6 pb-4 flex-none border-b dark:border-gray-700">
                <DialogTitle className="text-xl font-semibold">Profile Settings</DialogTitle>
                <DialogDescription>
                  Manage your account settings, brand details, and subscription.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-grow overflow-y-auto px-6">
                <form onSubmit={handleSettingsSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username / Brand Name</Label>
                    <Input id="username" name="username" value={formData.username} disabled className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar</Label>
                    <Input id="avatar" type="file" accept="image/jpeg,image/png" onChange={handleSettingsAvatarChange} className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Summary</Label>
                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleSettingsInputChange} placeholder="Tell everyone about your company" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleSettingsInputChange} placeholder="+1 (555) 123-4567" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={formData.website} onChange={handleSettingsInputChange} placeholder="https://your-company.com" className="border-gray-300 dark:border-gray-600" />
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold">Brand Details</h3>
                    <Button type="button" onClick={() => setIsBrandDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white" disabled={!selectedBrand}>
                      Edit Brand Details
                    </Button>
                  </div>
  
                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold">Subscription</h3>
                    {user.pro_access_ends_at ? (
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                        Your Pro plan is scheduled to cancel on{' '}
                        <strong>{format(new Date(user.pro_access_ends_at), 'MMMM dd, yyyy')}</strong>.
                        You will have access to Pro features until then.
                      </div>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={isCanceling}
                          >
                            {isCanceling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                            Cancel Subscription
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will schedule your subscription to be canceled at the end of your current billing period. You will retain access to Pro features until then.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Nevermind</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmCancellation}>
                              Yes, Schedule Cancellation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <DialogFooter className="pt-4 !mt-6">
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                      <Save className="mr-2 h-4 w-4" /> Save Profile
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="text-white">Loading...</div>
            </div>
          }
        >
          <SellerInfoPopup
            open={isSellerPopupOpen}
            onOpenChange={setIsSellerPopupOpen}
            seller={isSellerInfoLoading ? { id: "", username: "Loading..." } : selectedSellerInfo}
          />
          {selectedRep && (
            <SalesRepNameCardPopup
              rep={selectedRep}
              open={!!selectedRep}
              onOpenChange={() => setSelectedRep(null)}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default UserDashboard;
