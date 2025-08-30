import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "zh";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    "app.name": "Solerz",
    "app.tagline": "Solar Equipment Marketplace",
    "nav.home": "Home",
    "nav.deals": "Deals",
    "nav.howItWorks": "How It Works",
    "nav.pricing": "Pricing",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.profile": "Profile",
    "nav.myListings": "My Listings",
    "nav.orders": "Orders",
    "nav.favorites": "Favorites",
    "nav.logout": "Logout",
    "nav.createListing": "Create Listing",
    "nav.language": "Language",
    "nav.news": "News", // 添加新闻页面翻译
    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.username": "Username",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.forgotPassword": "Forgot Password?",
    "auth.resetPassword": "Reset Password",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",
    "auth.signUp": "Sign Up",
    "auth.signIn": "Sign In",
    // Dashboard
    "dashboard.welcome": "Welcome",
    "dashboard.stats": "Your Stats",
    "dashboard.listings": "Your Listings",
    "dashboard.favorites": "Your Favorites",
    "dashboard.orders": "Your Orders",
    "dashboard.tier": "Current Plan",
    "dashboard.upgrade": "Upgrade to Premium",
    "dashboard.listingsCount": "Listings",
    "dashboard.listingsRemaining": "Listings Remaining",
    "dashboard.memberSince": "Member Since",
    // Pricing
    "pricing.title": "Choose Your Plan",
    "pricing.subtitle": "Start selling your solar equipment today",
    "pricing.free.title": "Free",
    "pricing.free.price": "$0",
    "pricing.free.description": "Perfect for occasional sellers",
    "pricing.free.listings": "1 Free Listing",
    "pricing.free.support": "Basic Support",
    "pricing.free.visibility": "Standard Visibility",
    "pricing.free.button": "Current Plan",
    "pricing.paid.title": "Premium",
    "pricing.paid.price": "$19.99/month",
    "pricing.paid.description": "For serious sellers",
    "pricing.paid.listings": "Unlimited Listings",
    "pricing.paid.support": "Priority Support",
    "pricing.paid.visibility": "Enhanced Visibility",
    "pricing.paid.button": "Upgrade Now",
    "pricing.paid.current": "Current Plan",
    // Categories
    "category.all": "All",
    "category.panels": "Solar Panels",
    "category.inverters": "Inverters",
    "category.batteries": "Batteries",
    "category.mounting": "Mounting Systems",
    "category.controllers": "Charge Controllers",
    "category.accessories": "Accessories",
    // Filters
    "filter.title": "Filters",
    "filter.condition": "Condition",
    "filter.price": "Price",
    "filter.location": "Location",
    "filter.clear": "Clear All",
    // Panel-specific filters
    "filter.panels.type": "Panel Type",
    "filter.panels.wattage": "Wattage",
    "filter.panels.efficiency": "Efficiency",
    "filter.panels.mono": "Monocrystalline",
    "filter.panels.poly": "Polycrystalline",
    "filter.panels.thin": "Thin Film",
    "filter.panels.bifacial": "Bifacial",
    // Inverter-specific filters
    "filter.inverters.type": "Inverter Type",
    "filter.inverters.power": "Power Rating",
    "filter.inverters.string": "String",
    "filter.inverters.micro": "Microinverter",
    "filter.inverters.hybrid": "Hybrid",
    "filter.inverters.offgrid": "Off-Grid",
    "filter.inverters.gridtied": "Grid-Tied",
    // Battery-specific filters
    "filter.batteries.type": "Battery Type",
    "filter.batteries.capacity": "Capacity",
    "filter.batteries.voltage": "Voltage",
    "filter.batteries.lithium": "Lithium-Ion",
    "filter.batteries.leadacid": "Lead-Acid",
    "filter.batteries.flow": "Flow",
    "filter.batteries.saltwater": "Salt Water",
    // Product
    "product.condition": "Condition",
    "product.price": "Price",
    "product.location": "Location",
    "product.seller": "Seller",
    "product.postedOn": "Posted On",
    "product.quickView": "Quick View",
    "product.addToFavorites": "Add to Favorites",
    "product.contactSeller": "Contact Seller",
    "product.makeOffer": "Make an Offer",
    "product.description": "Description",
    "product.specifications": "Specifications",
    "product.similar": "Similar Products",
    // Create Listing
    "listing.create": "Create New Listing",
    "listing.edit": "Edit Listing",
    "listing.title": "Title",
    "listing.description": "Description",
    "listing.category": "Category",
    "listing.condition": "Condition",
    "listing.price": "Price",
    "listing.location": "Location",
    "listing.images": "Images",
    "listing.addImages": "Add Images",
    "listing.preview": "Preview Listing",
    "listing.publish": "Publish Listing",
    "listing.update": "Update Listing",
    "listing.fee": "Platform Fee",
    "listing.youReceive": "You Receive",
    // Search
    "search.placeholder": "Search for solar equipment...",
    "search.button": "Search",
    "search.noResults": "No products found. Try adjusting your filters.",
    "search.loading": "Loading more products...",
    "search.endOfResults": "You've reached the end of the catalog",
    // Footer
    "footer.about": "About Us",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.contact": "Contact Us",
    "footer.copyright": "© 2023 Solerz. All rights reserved.",
    // News
    "news.title": "News",
    "news.readMore": "Read More",
    "news.source": "Source",
    "news.keywords": "Keywords",
    "loading": "Loading...",
    "error.fetchNews": "Failed to load news",
    "news.date": "Date",
    "news.category": "Category",
    "nav.language.en": "Switch to English",
    "nav.language.zh": "Switch to Chinese"
  },
  zh: {
    // Common
    "app.name": "Solerz",
    "app.tagline": "太阳能设备市场",
    "nav.home": "首页",
    "nav.deals": "优惠",
    "nav.howItWorks": "使用方法",
    "nav.pricing": "价格",
    "nav.login": "登录",
    "nav.register": "注册",
    "nav.profile": "个人资料",
    "nav.myListings": "我的列表",
    "nav.orders": "订单",
    "nav.favorites": "收藏",
    "nav.logout": "退出",
    "nav.createListing": "创建列表",
    "nav.language": "语言",
    "nav.news": "新闻",
    // Auth
    "auth.email": "电子邮件",
    "auth.password": "密码",
    "auth.confirmPassword": "确认密码",
    "auth.username": "用户名",
    "auth.login": "登录",
    "auth.register": "注册",
    "auth.forgotPassword": "忘记密码？",
    "auth.resetPassword": "重置密码",
    "auth.noAccount": "没有账户？",
    "auth.haveAccount": "已有账户？",
    "auth.signUp": "注册",
    "auth.signIn": "登录",
    // Dashboard
    "dashboard.welcome": "欢迎",
    "dashboard.stats": "您的统计",
    "dashboard.listings": "您的列表",
    "dashboard.favorites": "您的收藏",
    "dashboard.orders": "您的订单",
    "dashboard.tier": "当前计划",
    "dashboard.upgrade": "升级到高级版",
    "dashboard.listingsCount": "列表数",
    "dashboard.listingsRemaining": "剩余列表数",
    "dashboard.memberSince": "会员开始日期",
    // Pricing
    "pricing.title": "选择您的计划",
    "pricing.subtitle": "立即开始销售您的太阳能设备",
    "pricing.free.title": "免费",
    "pricing.free.price": "¥0",
    "pricing.free.description": "适合偶尔卖家",
    "pricing.free.listings": "1个免费列表",
    "pricing.free.support": "基本支持",
    "pricing.free.visibility": "标准可见性",
    "pricing.free.button": "当前计划",
    "pricing.paid.title": "高级版",
    "pricing.paid.price": "$19.99/month",
    "pricing.paid.description": "适合专业卖家",
    "pricing.paid.listings": "无限列表",
    "pricing.paid.support": "优先支持",
    "pricing.paid.visibility": "增强可见性",
    "pricing.paid.button": "立即升级",
    "pricing.paid.current": "当前计划",
    // Categories
    "category.all": "全部",
    "category.panels": "太阳能板",
    "category.inverters": "逆变器",
    "category.batteries": "电池",
    "category.mounting": "安装系统",
    "category.controllers": "充电控制器",
    "category.accessories": "配件",
    // Filters
    "filter.title": "筛选",
    "filter.condition": "状况",
    "filter.price": "价格",
    "filter.location": "位置",
    "filter.clear": "清除全部",
    // Panel-specific filters
    "filter.panels.type": "面板类型",
    "filter.panels.wattage": "瓦数",
    "filter.panels.efficiency": "效率",
    "filter.panels.mono": "单晶",
    "filter.panels.poly": "多晶",
    "filter.panels.thin": "薄膜",
    "filter.panels.bifacial": "双面",
    // Inverter-specific filters
    "filter.inverters.type": "逆变器类型",
    "filter.inverters.power": "功率",
    "filter.inverters.string": "组串式",
    "filter.inverters.micro": "微型逆变器",
    "filter.inverters.hybrid": "混合式",
    "filter.inverters.offgrid": "离网",
    "filter.inverters.gridtied": "并网",
    // Battery-specific filters
    "filter.batteries.type": "电池类型",
    "filter.batteries.capacity": "容量",
    "filter.batteries.voltage": "电压",
    "filter.batteries.lithium": "锂离子",
    "filter.batteries.leadacid": "铅酸",
    "filter.batteries.flow": "流动",
    "filter.batteries.saltwater": "盐水",
    // Product
    "product.condition": "状况",
    "product.price": "价格",
    "product.location": "位置",
    "product.seller": "卖家",
    "product.postedOn": "发布日期",
    "product.quickView": "快速查看",
    "product.addToFavorites": "添加到收藏",
    "product.contactSeller": "联系卖家",
    "product.makeOffer": "出价",
    "product.description": "描述",
    "product.specifications": "规格",
    "product.similar": "类似产品",
    // Create Listing
    "listing.create": "创建新列表",
    "listing.edit": "编辑列表",
    "listing.title": "标题",
    "listing.description": "描述",
    "listing.category": "类别",
    "listing.condition": "状况",
    "listing.price": "价格",
    "listing.location": "位置",
    "listing.images": "图片",
    "listing.addImages": "添加图片",
    "listing.preview": "预览列表",
    "listing.publish": "发布列表",
    "listing.update": "更新列表",
    "listing.fee": "平台费用",
    "listing.youReceive": "您收到",
    // Search
    "search.placeholder": "搜索太阳能设备...",
    "search.button": "搜索",
    "search.noResults": "未找到产品。尝试调整筛选条件。",
    "search.loading": "加载更多产品...",
    "search.endOfResults": "您已到达目录末尾",
    // Footer
    "footer.about": "关于我们",
    "footer.terms": "服务条款",
    "footer.privacy": "隐私政策",
    "footer.contact": "联系我们",
    "footer.copyright": "© 2023 Solerz。保留所有权利。",
    // News
    "news.title": "新闻",
    "news.readMore": "阅读更多",
    "news.source": "来源",
    "news.keywords": "关键词",
    "loading": "加载中...",
    "error.fetchNews": "无法加载新闻",
    "news.date": "日期",
    "news.category": "类别",
    "nav.language.en": "英文",
    "nav.language.zh": "切换到中文"
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
