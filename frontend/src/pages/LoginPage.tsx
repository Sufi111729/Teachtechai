import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/endpoints";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => authApi.login(payload),
    onSuccess: (res) => {
      login(res.data.token, {
        userId: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        status: res.data.status,
        teacherProfileId: res.data.teacherProfileId ?? null
      });

      if (res.data.status !== "APPROVED") {
        navigate("/pending");
        return;
      }

      if (res.data.role === "ADMIN") navigate("/admin");
      if (res.data.role === "TEACHER") navigate("/teacher");
      if (res.data.role === "STUDENT") navigate("/student");
    },
    onError: () => toast.error("Invalid credentials")
  });

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center rounded-3xl border border-white/70 bg-white/70 p-10 shadow-soft backdrop-blur animate-rise reveal-1">
          <p className="text-xs uppercase tracking-[0.35em] text-brand/80">ApprovalHub</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink">Welcome back to your control room.</h1>
          <p className="mt-4 text-sm text-slate">
            Approve students, manage documents, and unlock AI insights from one calm workspace.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate">Fast approvals</p>
              <p className="mt-2 text-sm text-ink">Batch review pending students in minutes.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate">AI ready</p>
              <p className="mt-2 text-sm text-ink">Ask questions across your document library.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur animate-rise reveal-2">
          <h2 className="text-2xl font-semibold text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-slate">Use your credentials to continue.</p>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Email</label>
              <input
                {...register("email")}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm"
                placeholder="you@domain.com"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Password</label>
              <input
                {...register("password")}
                type="password"
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm"
                placeholder="Your password"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-sm text-slate">
            <Link to="/register-teacher" className="text-brand">
              Register as Teacher
            </Link>
            <Link to="/register-student" className="text-brand">
              Register as Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
