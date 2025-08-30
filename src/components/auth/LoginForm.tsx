// src/components/auth/LoginForm.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LoginForm] Form submission triggered:", { email });
    setLoading(true);
    try {
      type SignInResult = { error: any; needsProfileCompletion?: boolean };
      console.log("[LoginForm] Calling signIn...");
      const signInPromise = signIn(email, password);
      const timeoutPromise = new Promise<SignInResult>((_, reject) =>
        setTimeout(() => reject({ error: new Error("Login request timed out. Please check your internet connection and try again.") }), 10000)
      );
      const result: SignInResult = await Promise.race([signInPromise, timeoutPromise]);
      console.log("[LoginForm] signIn result:", result);
      const { error } = result;

      if (error) {
        console.error("[LoginForm] Login error:", error.message);
        let description = t("auth.loginError");
        if (error.message.includes("Email not confirmed")) {
          description = t("auth.emailNotVerified");
        } else if (error.message.includes("Invalid login credentials")) {
          description = t("auth.invalidCredentials");
        } else if (error.message.includes("timed out")) {
          description = error.message; // Use the custom timeout message
        } else {
          description = error.message || t("auth.loginError");
        }
        toast({
          title: t("auth.loginFailed"),
          description,
          variant: "destructive",
        });
        return;
      }

      // Navigation is handled by AuthContext; no need to navigate here
      console.log("[LoginForm] Sign-in successful, AuthContext will handle navigation.");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("[LoginForm] Unexpected error:", errorMessage);
      toast({
        title: t("auth.loginFailed"),
        description: errorMessage || t("auth.loginError"),
        variant: "destructive",
      });
    } finally {
      console.log("[LoginForm] Login attempt complete, loading:", false);
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("auth.login")}</CardTitle>
        <CardDescription>
          {t("auth.signIn")} {t("app.name")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          console.log("[LoginForm] Form onSubmit fired");
          handleSubmit(e);
        }} className="space-y-4">
          <div>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={() => console.log("[LoginForm] Button clicked")}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("auth.loggingIn")}
              </span>
            ) : (
              t("auth.login")
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline">
            {t("auth.forgotPassword")}
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="text-primary hover:underline">
            {t("auth.register")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
