"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { LogIn, UserPlus, Loader2, Zap } from "lucide-react";

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(fullName, email, password);
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Bir hata oluştu. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Arka plan degrade efekti */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-blue-950/20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TaskFlow</h1>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {mode === "login" ? "Tekrar hoş geldiniz" : "Hesap oluştur"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "TaskFlow hesabınıza giriş yapın"
                : "Ücretsiz hesabınızı oluşturun"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium block mb-1.5">Ad Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium block mb-1.5">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmet@sirket.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "login" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
              <span className="text-violet-400 font-medium hover:text-violet-300">
                {mode === "login" ? "Kayıt ol" : "Giriş yap"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
