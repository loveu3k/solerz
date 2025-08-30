import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import Navbar from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase.ts";
import { useToast } from "./ui/use-toast";
import Select from "react-select";
import { Bookmark } from "lucide-react"; 
import { useNavigate } from "react-router-dom";


// Move constants outside component to prevent redefinition
const FILTER_CONFIGS = {
  solar_panels: [
    { key: "brand", label: "Brand", type: "select", options: [], sortable: true },
    { key: "model", label: "Model", type: "text", sortable: true },
    {
      key: "panel_type",
      label: "Type",
      type: "multi-select",
      options: [
        { value: "n-type", label: "n-type" },
        { value: "p-type", label: "p-type" },
        { value: "IBC", label: "IBC" },
        { value: "ABC", label: "ABC" },
        { value: "TOPCon", label: "TOPCon" },
        { value: "HJT", label: "HJT" },
        { value: "PERC", label: "PERC" },
        { value: "Bifacial", label: "Bifacial" },
        { value: "Monofacial", label: "Monofacial" },
        { value: "Thin-Film", label: "Thin-Film" },
        { value: "Standard Rigid", label: "Standard Rigid" },
        { value: "Flexible", label: "Flexible" },
        { value: "BIPV", label: "BIPV" },
        { value: "Shingled", label: "Shingled" },
        { value: "Polycrystalline", label: "Polycrystalline" },
      ],
      sortable: true,
    },
    { key: "power_rating_watts", label: "Pwr (W)", type: "number", sortable: true, min: 0 },
    { key: "efficiency_percentage", label: "Eff (%)", type: "number", sortable: true, min: 0 },
    { key: "open_circuit_voltage_volts", label: "Voc", type: "number", sortable: true, min: 0 },
    { key: "max_power_voltage_volts", label: "Vmp", type: "number", sortable: true, min: 0 },
    { key: "short_circuit_current_amps", label: "Isc", type: "number", sortable: true, min: 0 },
    { key: "max_power_current_amps", label: "Imp", type: "number", sortable: true, min: 0 },
    { key: "length_mm", label: "Len", type: "number", sortable: true, min: 0 },
    { key: "width_mm", label: "Wid", type: "number", sortable: true, min: 0 },
    { key: "thickness_mm", label: "Thk", type: "number", sortable: true, min: 0 },
    { key: "weight_kg", label: "kg", type: "number", sortable: true, min: 0 },
  ],
  inverters: [
    { key: "brand", label: "Brand", type: "select", options: [], sortable: true },
    { key: "model", label: "Model", type: "text", sortable: true },
    { key: "inverter_type", label: "Type", type: "select", options: ["String", "Microinverter", "Hybrid", "Off-Grid", "Grid-Tied", "Central"], sortable: true },
    { key: "max_dc_voltage", label: "Max Vdc", type: "number", sortable: true, min: 0 },
    { key: "mppt_voltage_min", label: "MPPT Min", type: "number", sortable: true, min: 0 },
    { key: "mppt_voltage_max", label: "MPPT Max", type: "number", sortable: true, min: 0 },
    { key: "num_of_mppt", label: "MPPTs", type: "number", sortable: true, min: 0 },
    { key: "max_dc_current", label: "Max Idc", type: "number", sortable: true, min: 0 },
    { key: "max_dc_shortcircuit_current", label: "Isc DC", type: "number", sortable: true, min: 0 },
    { key: "rated_ac_power", label: "Rated (W)", type: "number", sortable: true, min: 0 },
    { key: "max_ac_power", label: "Max (W)", type: "number", sortable: true, min: 0 },
    { key: "rated_ac_current", label: "Rated Iac", type: "number", sortable: true, min: 0 },
    { key: "max_ac_current", label: "Max Iac", type: "number", sortable: true, min: 0 },
    { key: "max_effi", label: "Max Eff (%)", type: "number", sortable: true, min: 0 },
    { key: "europe_effi", label: "EU Eff (%)", type: "number", sortable: true, min: 0 },
  ],
};

const TABLE_MAP = {
  solar_panels: "solar_panels",
  inverters: "inverters",
};

const PRODUCT_OPTIONS = [
  { value: "solar_panels", label: "Solar Panel" },
  { value: "inverters", label: "Inverter" },
];

const NEGATIVE_ALLOWED_KEYS = [
  "temp_coefficient_power_percentage_per_celsius",
  "temp_coefficient_voltage_percentage_per_celsius",
  "temp_coefficient_current_percentage_per_celsius",
];

const SellerInfoPopup = lazy(() => import("./SellerInfoPopup"));

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Home = () => {
  const { user } = useAuth() || { user: null };
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("solar_panels");
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
  const [isSellerPopupOpen, setIsSellerPopupOpen] = useState(false);
  const [selectedSellerInfo, setSelectedSellerInfo] = useState(null);
  const [isSellerInfoLoading, setIsSellerInfoLoading] = useState(false);
  const [favoriteProductIds, setFavoriteProductIds] = useState(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // New state for total item count

  useEffect(() => {
    if (user) {
      setFavoritesLoading(true);
      const fetchFavorites = async () => {
        const { data, error } = await supabase
          .from('favorites')
          .select('item_id')
          .eq('user_id', user.id)
          .eq('type', 'product');

        if (!error && data) {
          setFavoriteProductIds(new Set(data.map(fav => fav.item_id)));
        }
        setFavoritesLoading(false);
      };
      fetchFavorites();
    } else {
      setFavoriteProductIds(new Set());
      setFavoritesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const preventCopy = (e) => {
      e.preventDefault();
      toast({ title: "Action Blocked", description: "Copying is not allowed.", variant: "destructive" });
    };
    const preventContextMenu = (e) => e.preventDefault();

    document.addEventListener("copy", preventCopy);
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [toast]);

  const handleToggleFavorite = async (product) => {
    // AMENDED: Redirect unregistered users
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

    const { id, model } = product;
    const originalFavorites = new Set(favoriteProductIds);
    const isCurrentlyFavorited = originalFavorites.has(id);

    const newFavorites = new Set(originalFavorites);
    if (isCurrentlyFavorited) {
        newFavorites.delete(id);
    } else {
        newFavorites.add(id);
    }
    setFavoriteProductIds(newFavorites);

    try {
        if (isCurrentlyFavorited) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', id);
            if (error) throw error; 
            toast({ title: "Removed", description: `${model} removed from saved items.`, duration: 2000 });
        } else {
            const { error } = await supabase.from('favorites').insert({
                user_id: user.id,
                type: 'product',
                item_id: id,
                item_details: { ...product, name: product.model, category: selectedCategory },
            });

            if (error && error.code === '23505') {
                 toast({
                    title: "Already Saved",
                    description: `${model} is already in your saved items.`,
                    duration: 2000,
                });
            } else if (error) {
                throw error;
            } else {
                toast({ title: "Saved!", description: `${model} has been saved.`, duration: 2000 });
            }
        }
    } catch (error) {
        setFavoriteProductIds(originalFavorites);
        toast({
            title: "Error",
            description: "Could not update your saved items. Please try again.",
            variant: "destructive",
            duration: 2000,
        });
    }
  };

  const fetchProductsAndCount = useCallback(async (category, page = 1, currentFilters = filters, sortKey = null, sortDirection = "asc") => {
    setIsLoading(true);
    setError(null);
    setProducts([]);

    try {
      const tableName = TABLE_MAP[category];
      if (!tableName) throw new Error("Invalid category specified");

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // 1. Fetch total count with filters
      let countQuery = supabase.from(tableName).select("*", { count: 'exact', head: true });
      // Apply filters to count query
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (!value || value.length === 0) return;
        const filterDef = FILTER_CONFIGS[selectedCategory]?.find((f) => f.key === key);
        if (!filterDef) return;

        if (filterDef.type === "number") {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            countQuery = countQuery.gte(key, numValue);
          }
        } else if (filterDef.type === "multi-select") {
          const selectedValues = value.map((opt) => opt.value);
          countQuery = countQuery.filter(key + '.cs', `{${selectedValues.join(',')}}`);
        } else if (filterDef.type === "text") {
          countQuery = countQuery.ilike(key, `%${value}%`);
        } else if (filterDef.type === "select" && filterDef.key === "brand" && value) {
          const selectedBrandValue = value.value || value;
          countQuery = countQuery.ilike(key, selectedBrandValue);
        }
      });

      const { count, error: countError } = await countQuery;
      if (countError) throw new Error(`Failed to count ${tableName}: ${countError.message || "Unknown error"}`);
      setTotalItems(count || 0);

      // 2. Fetch paginated data with filters and sorting
      let dataQuery = supabase.from(tableName).select("*");

      // Apply filters to data query
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (!value || value.length === 0) return;
        const filterDef = FILTER_CONFIGS[selectedCategory]?.find((f) => f.key === key);
        if (!filterDef) return;

        if (filterDef.type === "number") {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            dataQuery = dataQuery.gte(key, numValue);
          }
        } else if (filterDef.type === "multi-select") {
          const selectedValues = value.map((opt) => opt.value);
          dataQuery = dataQuery.filter(key + '.cs', `{${selectedValues.join(',')}}`);
        } else if (filterDef.type === "text") {
          dataQuery = dataQuery.ilike(key, `%${value}%`);
        } else if (filterDef.type === "select" && filterDef.key === "brand" && value) {
          const selectedBrandValue = value.value || value;
          dataQuery = dataQuery.ilike(key, selectedBrandValue);
        }
      });


      if (sortKey) {
        dataQuery = dataQuery.order(sortKey, { ascending: sortDirection === "asc" });
      } else if (category === "solar_panels") {
        dataQuery = dataQuery.order("power_rating_watts", { ascending: false });
      } else if (category === "inverters") {
        dataQuery = dataQuery.order("max_dc_current", { ascending: false });
      }

      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;
      if (error) throw new Error(`Failed to query ${tableName}: ${error.message || "Unknown error"}`);

      setProducts(data || []);
    } catch (error) {
      const errorMessage = error.message || "An unexpected error occurred";
      setError(`Failed to load ${category.replace("_", " ")} catalog: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to load ${category} catalog: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, toast, selectedCategory, filters]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displayProducts = products;

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const newDirection = prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      setCurrentPage(1);
      fetchProductsAndCount(selectedCategory, 1, filters, key, newDirection);
      return { key, direction: newDirection };
    });
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
        .from('brands')
        .select('*, sales_representatives(*)')
        .ilike('name', trimmedBrandName);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Brand profile not found in the database.");
      }
      
      const brandData = data[0];
      const mappedData = {
        id: brandData.id, 
        username: brandData.name,
        avatar_url: brandData.logo_url,
        bio: brandData.summary,
        phone: brandData.contact_phone,
        email: brandData.contact_email,
        social_links: brandData.social_links,
        videos: brandData.videos || [],
        sales_contacts: brandData.sales_representatives || [],
        certifications: brandData.certifications || [],
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

  const clearFilters = () => {
    setFilters({});
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
    fetchProductsAndCount(selectedCategory, 1, {}, null, "asc");
  };

  const debouncedHandleFilterChange = useCallback(
    debounce((key, value) => {
      const filterDef = FILTER_CONFIGS[selectedCategory].find((f) => f.key === key);
      let adjustedValue = value;
      if (filterDef.type === "number" && value !== "") {
        const isNegativeAllowed = NEGATIVE_ALLOWED_KEYS.includes(key);
        adjustedValue = isNegativeAllowed ? parseFloat(value) : Math.max(0, parseFloat(value));
        if (isNaN(adjustedValue)) adjustedValue = "";
      }
      
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: adjustedValue };
        setCurrentPage(1);
        fetchProductsAndCount(selectedCategory, 1, newFilters, sortConfig.key, sortConfig.direction);
        return newFilters;
      });
    }, 300),
    [selectedCategory, sortConfig.key, sortConfig.direction, fetchProductsAndCount]
  );

  useEffect(() => {
    fetchProductsAndCount(selectedCategory, currentPage, filters, sortConfig.key, sortConfig.direction);
  }, [selectedCategory, currentPage, filters, sortConfig.key, sortConfig.direction, fetchProductsAndCount]);

  useEffect(() => {
    const fetchAndStoreBrandOptions = async () => {
      try {
        // Fetch brand names directly from the 'brands' table
        const { data: brandsData, error: fetchError } = await supabase
          .from("brands")
          .select("name")
          .order("name", { ascending: true }); // Order alphabetically

        if (fetchError) {
          console.error("Error fetching brand options from Supabase:", fetchError);
          return;
        }

        if (!brandsData || brandsData.length === 0) {
          // No brands found in the brands table
          const brandFilter = FILTER_CONFIGS[selectedCategory]?.find((f) => f.key === "brand");
          if (brandFilter) {
            brandFilter.options = []; // Clear options if no brands
          }
          return;
        }

        const brandOptions = brandsData
          .map((item) => item.name) // Map 'name' from the brands table
          .filter(Boolean) // Filter out any null/undefined brand names
          .map((brand) => ({ value: brand, label: brand }));

        const brandFilter = FILTER_CONFIGS[selectedCategory]?.find((f) => f.key === "brand");
        if (brandFilter) {
          brandFilter.options = brandOptions;
        }
      } catch (error) {
        console.error("Unexpected error fetching brand options:", error);
      }
    };

    fetchAndStoreBrandOptions();
  }, [selectedCategory]); // Dependency on selectedCategory remains for re-fetching when category changes

  return (
    <div className="min-h-screen text-foreground dark:text-gray-200" style={{ backgroundColor: "var(--background)", userSelect: "none" }}>
      <Navbar isLoggedIn={!!user} />
      <main className="container mx-auto pt-24 pb-16 px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex gap-2 border-b border-border dark:border-gray-800">
              {PRODUCT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedCategory(option.value);
                    setFilters({});
                    setSortConfig({ key: null, direction: "asc" });
                    setCurrentPage(1);
                  }}
                  className={`py-3 px-4 sm:px-8 text-lg font-bold transition-colors duration-200 border-b-4 ${
                    selectedCategory === option.value
                      ? "text-amber-500 dark:text-amber-400 border-amber-500 dark:border-amber-400"
                      : "text-muted-foreground dark:text-gray-400 border-transparent hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500 dark:hover:border-amber-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedCategory && (
          <>
            <div className="bg-background dark:bg-gray-900 p-4 mb-6 rounded-xl shadow-md border border-border dark:border-gray-800 overflow-x-auto">
              <div className="flex flex-nowrap gap-3">
                {FILTER_CONFIGS[selectedCategory]?.map((filter) => (
                  <div key={filter.key} className="flex-shrink-0">
                    <label className="block text-xs font-medium text-muted-foreground dark:text-gray-400 mb-1">
                      {filter.label}
                    </label>
                    {filter.type === "number" ? (
                      <input
                        type="number"
                        placeholder={filter.label}
                        min={filter.min !== undefined ? filter.min : undefined}
                        step={filter.key.includes("temp_coefficient") ? "0.001" : "0.01"}
                        value={filters[filter.key] ?? ""}
                        onChange={(e) => debouncedHandleFilterChange(filter.key, e.target.value)}
                        className="w-20 p-2 border border-border dark:border-gray-700 bg-background dark:bg-gray-900 text-foreground dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                    ) : filter.type === "multi-select" ? (
                      <Select
                        isMulti
                        options={filter.options}
                        value={filters[filter.key] || []}
                        onChange={(selected) => debouncedHandleFilterChange(filter.key, selected || [])}
                        className="w-24 text-sm"
                        classNamePrefix="react-select"
                        placeholder="Select..."
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          control: (base) => ({
                            ...base,
                            height: "38px",
                            minHeight: "38px",
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                            borderRadius: "0.375rem",
                            padding: "0 0.5rem",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "var(--border)",
                            },
                            "&:focus-within": {
                              borderColor: "#f59e0b",
                              boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.5)",
                            },
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: "0 0.25rem",
                            overflowX: "auto",
                            display: "flex",
                            flexWrap: "nowrap",
                            height: "100%",
                            alignItems: "center",
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": {
                              display: "none",
                            },
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "var(--muted)",
                            borderRadius: "0.25rem",
                            margin: "0 2px",
                            flexShrink: 0,
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "var(--foreground)",
                            fontSize: "0.75rem",
                            padding: "2px 4px",
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: "var(--foreground)",
                            padding: "2px",
                            "&:hover": {
                              backgroundColor: "var(--destructive)",
                              color: "white",
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            width: "200px",
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.375rem",
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: "300px",
                            padding: "0",
                          }),
                          option: (base, { isFocused, isSelected }) => ({
                            ...base,
                            backgroundColor: isSelected
                              ? "var(--muted)"
                              : isFocused
                              ? "var(--muted)"
                              : "var(--background)",
                            color: "var(--foreground)",
                            fontSize: "0.875rem",
                            padding: "0.5rem 1rem",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "var(--muted-foreground)",
                            fontSize: "0.875rem",
                          }),
                          input: (base) => ({
                            ...base,
                            color: "var(--foreground)",
                            fontSize: "0.875rem",
                            margin: "0",
                            padding: "0",
                          }),
                        }}
                      />
                    ) : filter.type === "select" && filter.key === "brand" ? (
                      <Select
                        options={filter.options}
                        value={filter.options.find(opt => opt.value === filters[filter.key]) || null}
                        onChange={(selected) => debouncedHandleFilterChange(filter.key, selected?.value || "")}
                        className="w-24 text-sm"
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        noOptionsMessage={() => "No brands available"}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({
                            ...base,
                            height: "38px",
                            minHeight: "38px",
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                            borderRadius: "0.375rem",
                            padding: "0 0.5rem",
                            boxShadow: "none",
                            "&:hover": { borderColor: "var(--border)" },
                            "&:focus-within": {
                              borderColor: "#f59e0b",
                              boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.5)",
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                            borderRadius: "0.375rem",
                          }),
                          menuList: (base) => ({
                            ...base,
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                          }),
                          option: (base, { isFocused, isSelected }) => ({
                            ...base,
                            backgroundColor: isSelected
                              ? "var(--muted)"
                              : isFocused
                              ? "var(--muted)"
                              : "var(--background)",
                            color: "var(--foreground)",
                            fontSize: "0.875rem",
                            padding: "0.5rem 1rem",
                          }),
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={filter.label}
                        value={filters[filter.key] || ""}
                        onChange={(e) => debouncedHandleFilterChange(filter.key, e.target.value)}
                        className="w-24 p-2 border border-border dark:border-gray-700 bg-background dark:bg-gray-900 text-foreground dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={clearFilters}
                className="mt-3 text-red-600 dark:text-red-400 hover:underline text-sm"
              >
                Clear Filters
              </button>
            </div>

            <div className="bg-background dark:bg-gray-900 rounded-xl shadow-md border border-border dark:border-gray-800 overflow-x-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground dark:text-gray-400">Loading...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500 dark:text-red-400">{error}</div>
              ) : displayProducts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground dark:text-gray-400">No data available</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted dark:bg-gray-800">
                    <tr>
                      {FILTER_CONFIGS[selectedCategory]?.map((filter) => (
                        <th
                          key={filter.key}
                          className={`p-3 border-b border-border dark:border-gray-800 text-left font-medium min-w-fit whitespace-nowrap ${
                            filter.sortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" : ""
                          }`}
                          onClick={() => filter.sortable && handleSort(filter.key)}
                        >
                          {filter.label}
                          {sortConfig.key === filter.key && (
                            <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                          )}
                        </th>
                      ))}
                      <th className="p-3 border-b border-border dark:border-gray-800 text-left font-medium min-w-fit">PDF</th>
                      <th className="p-3 border-b border-border dark:border-gray-800 text-left font-medium">Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border dark:border-gray-800 hover:bg-muted dark:hover:bg-gray-800">
                        {FILTER_CONFIGS[selectedCategory]?.map((filter) => (
                          <td key={filter.key} className="p-3">
                            {filter.key === "brand" ? (
                              <button
                                onClick={() => handleBrandClick(product[filter.key])}
                                className="text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 hover:underline whitespace-nowrap"
                              >
                                {product[filter.key]}
                              </button>
                            ) : filter.key === "panel_type" ? (
                              product[filter.key]?.length > 0 ? product[filter.key].join(", ") : "N/A"
                            ) : (
                              product[filter.key] ?? "N/A"
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
                          <button onClick={() => handleToggleFavorite(product)} title="Save item" disabled={favoritesLoading}>
                            <Bookmark className={`w-5 h-5 transition-colors ${!favoritesLoading && favoriteProductIds.has(product.id) ? 'text-amber-500 fill-current' : 'text-gray-400 hover:text-amber-400'}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-muted-foreground dark:text-gray-400">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-4 py-2 bg-background dark:bg-gray-900 text-foreground dark:text-gray-200 rounded-md border border-border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-center">
                  Page {currentPage} of {totalPages} ({totalItems} items)
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-4 py-2 bg-background dark:bg-gray-900 text-foreground dark:text-gray-200 rounded-md border border-border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="text-white">Loading...</div>
          </div>
      }>
        <SellerInfoPopup
          open={isSellerPopupOpen}
          onOpenChange={setIsSellerPopupOpen}
          seller={isSellerInfoLoading ? { username: 'Loading...' } : selectedSellerInfo}
        />
      </Suspense>
    </div>
  );
};

export default Home;
