import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { login as loginApi } from "../services/authService";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5 }}
        className="w-full max-w-md rounded-3xl border border-gray-800 bg-gray-900/70 backdrop-blur-xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500">
            <Mail className="text-white" size={30} />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Login to continue using Dogesh Signal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            placeholder="Enter your email"
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
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input type="checkbox" className="accent-cyan-500" />
              Remember me
            </label>
            <button type="button" className="text-cyan-400 hover:text-cyan-300 text-sm">
              Forgot Password?
            </button>
          </div>

          <Button disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        <button 
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full cursor-pointer rounded-xl border border-gray-700 py-3 text-white transition hover:bg-gray-800"
        >
          Continue as Guest
        </button>

        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
