import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { login as loginApi } from "../services/authService";
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
    } catch {
      toast.error("Invalid Credentials");
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
