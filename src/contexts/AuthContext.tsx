import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string | null;
  tier: "free" | "pro";
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  website: string | null;
  brand_id: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  pro_access_ends_at?: string | null;
}

interface User extends Profile {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null; user: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  upgradeToPaid: (tier: "pro") => Promise<{ error: string | null }>;
  checkUser: (options?: { force?: boolean }) => Promise<void>; // AMENDED: Expose function type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cachedUser = localStorage.getItem("authUser");
  const [user, setUser] = useState<User | null>(cachedUser ? JSON.parse(cachedUser) : null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const lastUserIdRef = useRef<string | null>(null);
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const isMountedRef = useRef(true);
  const checkUserDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const getSessionWithRetry = async (retries = 3, delay = 500): Promise<{ data: { session: Session | null }, error: any }> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await supabase.auth.getSession();
        return result;
      } catch (error) {
        console.error(`[Auth] getSession attempt ${attempt} failed:`, error);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("getSession failed after retries");
  };

  const checkUser = useCallback(async (options: { force?: boolean } = {}) => {
    try {
      const { data: { session }, error: sessionError } = await getSessionWithRetry();
      
      if (!isMountedRef.current) return;

      if (sessionError || !session?.user) {
        setUser(null);
        localStorage.removeItem("authUser");
        setLoading(false);
        return;
      }

      const authUser = session.user as SupabaseUser;

      if (lastUserIdRef.current === authUser.id && user && !options.force) {
        setLoading(false);
        return;
      }

      lastUserIdRef.current = authUser.id;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*") 
        .eq("id", authUser.id)
        .single();
      
      if (!isMountedRef.current) return;

      if (profileError && profileError.code !== "PGRST116") {
         console.error("[Auth] Profile fetch error:", profileError.message);
         setUser(null);
         localStorage.removeItem("authUser");
      } else if (profileData) {
        const userData: User = {
          email: authUser.email || "",
          ...profileData
        };
        setUser(userData);
        localStorage.setItem("authUser", JSON.stringify(userData));
        
        if (window.location.pathname === "/login" || window.location.pathname === "/register") {
          navigate("/dashboard");
        }
      }
      setLoading(false);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setUser(null);
      localStorage.removeItem("authUser");
      setLoading(false);
    } 
  }, [navigate, user]);

  const debouncedCheckUser = useCallback(() => {
    if (checkUserDebounceRef.current) clearTimeout(checkUserDebounceRef.current);
    checkUserDebounceRef.current = setTimeout(() => checkUser(), 100);
  }, [checkUser]);

  useEffect(() => {
    isMountedRef.current = true;
    debouncedCheckUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMountedRef.current) return;
        debouncedCheckUser();
    });
    authListenerRef.current = { data: authListener };

    return () => {
      isMountedRef.current = false;
      if (checkUserDebounceRef.current) clearTimeout(checkUserDebounceRef.current);
      if (authListenerRef.current) authListenerRef.current.data.subscription.unsubscribe();
    };
  }, [debouncedCheckUser]);

  const signIn = async (email: string, password: string) => {
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        await checkUser();
        return { error: null };
    } catch (err: any) {
        return { error: err.message };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (error) throw error;

      const { error: profileError } = await supabase.from('profiles').insert([
          { id: data.user!.id, username: username, tier: 'free' }
      ]);

      if (profileError) throw profileError;

      return { error: null, user: data.user };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      return { error: errorMessage, user: null };
    }
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("authUser");
    lastUserIdRef.current = null;
    navigate("/login");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? error.message : null };
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: "Not authenticated" };
    try {
        const { error } = await supabase.from("profiles").update(data).eq("id", user.id);
        if (error) return { error: error.message };
        
        await checkUser({ force: true });
        return { error: null };
    } catch (err: any) {
        return { error: err.message };
    }
  };

  const upgradeToPaid = async (tier: "pro") => {
    if (!user) return { error: "Not authenticated" };
    try {
        if (tier !== "pro") {
          return { error: "Invalid tier specified" };
        }
        const { error } = await supabase.from("profiles").update({ tier }).eq("id", user.id);
        if (error) return { error: error.message };
        await checkUser({ force: true });
        return { error: null };
    } catch (err: any) {
        return { error: err.message };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    upgradeToPaid,
    checkUser, // <-- AMENDED: Expose checkUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
