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
import { toast } from "sonner";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  if (loading) return null;
  if (session) return <Navigate to="/admin/overview" replace />;

  const onSubmit = async (data: SignupForm) => {
    setServerError("");
    setSubmitting(true);
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    
    setSubmitting(false);
    
    if (error) {
      setServerError(error.message || "Failed to create account. Please try again.");
    } else {
      // Check if email confirmation is required by observing if session is null
      if (authData.user && !authData.session) {
        toast.info("Account created! Please check your email to verify your account.", { duration: 6000 });
        navigate("/admin/login", { replace: true });
      } else {
        toast.success("Welcome to BistroBox!");
        navigate("/admin/overview", { replace: true });
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Soft animated background elements */}
      <div className="absolute top-1/4 left-0 w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />
      
      <div className="z-10 mb-8 flex items-center justify-center">
        <Link to="/" className="text-2xl font-bold tracking-tight text-foreground transition-transform hover:scale-[1.02]">
          Bistro<span className="text-primary">Box</span>
        </Link>
      </div>

      <div className="glass-card z-10 w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-fade-in">
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Create your account</h2>
        <p className="mb-6 text-sm text-muted-foreground">Start managing your digital menu today.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="owner@cafe.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          
          {serverError && <p className="text-sm font-medium text-destructive">{serverError}</p>}
          
          <Button type="submit" className="w-full mt-2" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/admin/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
