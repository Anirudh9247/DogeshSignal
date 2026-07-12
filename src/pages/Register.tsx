import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { register as registerApi } from "../services/authService";
import { DogeshLogo, FloatingSystemParticles } from "../components/BrandSystem";

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
      return { text: "Weak", color: "bg-rose-500", width: "w-1/3" };

    if (score === 3 || score === 4)
      return { text: "Medium", color: "bg-amber-500", width: "w-2/3" };

    return { text: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getStrength();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerApi(data);
      toast.success("Account Created Successfully");
      navigate("/login");
    } catch {
      toast.error("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden dark bg-slate-950 text-slate-100 items-center justify-center p-5">
      <FloatingSystemParticles />
      <div className="absolute top-[-5%] right-[-10%] w-[38%] h-[35%] bg-orange-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-950/25 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-xs mt-2">Join Dogesh Signal today</p>
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
            placeholder="you@domain.com"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <PasswordInput
              label="Password"
              register={register}
              name="password"
              error={errors.password?.message}
            />

            {password && (
              <div className="mt-3 text-left">
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                </div>
                <p className="mt-2 text-[10px] font-mono text-slate-400">
                  Password Strength: 
                  <span className="text-slate-200 font-bold"> {strength.text}</span>
                </p>
              </div>
            )}
          </div>

          <PasswordInput
            label="Confirm Password"
            register={register}
            name="confirmPassword"
            error={errors.confirmPassword?.message}
          />

          <div className="text-left">
            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
              <input type="checkbox" {...register("terms")} className="accent-orange-500 rounded mt-0.5" />
              <span>I agree to the Terms & Conditions</span>
            </label>
            {errors.terms && <p className="text-rose-500 text-xs mt-1.5 font-mono">{errors.terms.message}</p>}
          </div>

          <Button disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-xs">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
