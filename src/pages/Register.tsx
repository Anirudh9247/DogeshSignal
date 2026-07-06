import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../components/Input";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { register as registerApi } from "../services/authService";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[@$!%*?&]/, "Must contain a special character"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "Accept Terms & Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const getStrength = () => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2)
      return { text: "Weak", color: "bg-red-500", width: "w-1/3" };

    if (score === 3 || score === 4)
      return { text: "Medium", color: "bg-yellow-500", width: "w-2/3" };

    return { text: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = getStrength();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
        await registerApi(data);
        toast.success("Account Created Successfully");
        navigate("/");
    } catch {
        toast.error("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black p-5">
      <motion.div
        initial={{ opacity: 0, scale: .9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: .5 }}
        className="w-full max-w-md rounded-3xl bg-gray-900/70 backdrop-blur-xl border border-gray-800 shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500">
            <UserPlus className="text-white" size={30} />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join Dogesh Signal today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}

            <div className="mt-3">
              <div className="h-2 rounded-full bg-gray-700">
                <div className={`h-2 rounded-full ${strength.color} ${strength.width}`} />
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Password Strength :
                <span className="text-white font-semibold">{" "}{strength.text}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Confirm Password</label>
            <div className="relative mt-2">
              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-3 text-gray-400"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <label className="flex items-center gap-3 text-gray-300">
            <input type="checkbox" {...register("terms")} className="accent-cyan-500" />
            I agree to the Terms & Conditions
          </label>
          {errors.terms && <p className="text-red-400 text-sm">{errors.terms.message}</p>}

          <Button disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/" className="text-cyan-400 font-semibold hover:text-cyan-300">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
