import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotSchema = z.object({
  resetEmail: z.string().email("Enter a valid email address"),
});

type LoginForm = z.infer<typeof loginSchema>;
type ForgotForm = z.infer<typeof forgotSchema>;

export default function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forgot-password mode
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    getValues: getResetValues,
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  if (loading) return null;
  if (session) return <Navigate to="/admin/overview" replace />;

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setSubmitting(false);
    if (error) {
      setServerError("Invalid credentials. Please try again.");
    } else {
      navigate("/admin/overview", { replace: true });
    }
  };

  const onResetSubmit = async (data: ForgotForm) => {
    setResetError("");
    setResetSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.resetEmail, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    setResetSubmitting(false);
    if (error) {
      setResetError(error.message || "Failed to send reset email. Please try again.");
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="glass-card w-full max-w-sm rounded-xl p-8">
        <h1 className="mb-1 text-2xl font-bold text-foreground">
          Bistro<span className="text-primary">Box</span>
        </h1>

        {!showForgot ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">Sign in to manage your menu</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setServerError(""); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/admin/signup" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {resetSent ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                  ✅ Reset link sent to <span className="font-semibold">{getResetValues("resetEmail")}</span>. Check your inbox (and spam folder).
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setShowForgot(false); setResetSent(false); setResetError(""); }}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" {...registerReset("resetEmail")} />
                  {resetErrors.resetEmail && (
                    <p className="text-xs text-destructive">{resetErrors.resetEmail.message}</p>
                  )}
                </div>
                {resetError && <p className="text-sm text-destructive">{resetError}</p>}
                <Button type="submit" className="w-full" disabled={resetSubmitting}>
                  {resetSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setResetError(""); }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Sign In
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
