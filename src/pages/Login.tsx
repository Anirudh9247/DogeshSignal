import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { login as loginApi, signInWithProvider } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { DogeshLogo, FloatingSystemParticles } from "../components/BrandSystem";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const auth = useAuth();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginApi(data);
      auth.login(response.data.token, response.data.user);
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid Credentials");
    }
  };

  const handleSocialLogin = async (provider: "google" | "twitter" | "linkedin") => {
    try {
      const response = await signInWithProvider(provider);
      if (response && response.data && response.data.user) {
        auth.login(response.data.token, response.data.user);
        toast.success(`Logged in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden dark bg-slate-950 text-slate-100 items-center justify-center p-5">
      <FloatingSystemParticles />
      <div className="absolute top-[-5%] right-[-10%] w-[38%] h-[35%] bg-orange-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-950/25 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="w-11 h-11 flex items-center justify-center">
              <DogeshLogo className="w-11 h-11" />
            </div>
            <div className="text-left">
              <span className="font-sans font-extrabold tracking-tight text-lg leading-none block text-white">
                Dogesh Signal
              </span>
              <span className="text-[10px] font-sans font-bold tracking-wider text-orange-400 block leading-none mt-1 uppercase">
                Instinct Radar
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-slate-400 text-xs">Login to continue using Dogesh Signal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            placeholder="you@domain.com"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            register={register}
            name="password"
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer select-none">
              <input type="checkbox" className="accent-orange-500 rounded" />
              Remember me
            </label>
            <button type="button" className="text-orange-400 hover:text-orange-300 text-xs font-semibold cursor-pointer">
              Forgot Password?
            </button>
          </div>

          <Button disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="px-4 text-slate-500 text-[10px] font-mono font-bold tracking-wider uppercase">OR SIGN IN WITH</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 transition cursor-pointer"
            title="Sign in with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.54l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("twitter")}
            className="flex items-center justify-center py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 transition cursor-pointer"
            title="Sign in with X (Twitter)"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("linkedin")}
            className="flex items-center justify-center py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 transition cursor-pointer"
            title="Sign in with LinkedIn"
          >
            <svg className="w-5 h-5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z"/>
            </svg>
          </button>
        </div>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="px-4 text-slate-500 text-xs font-mono font-bold">OR</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button 
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full cursor-pointer rounded-xl border border-slate-800 py-3 text-slate-200 text-sm font-semibold transition hover:bg-slate-850"
        >
          Continue as Guest
        </button>

        <p className="mt-6 text-center text-slate-400 text-xs">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
