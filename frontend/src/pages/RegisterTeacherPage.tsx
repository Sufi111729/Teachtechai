import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/endpoints";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  teacherCode: z.string().min(3),
  department: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function RegisterTeacherPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => authApi.registerTeacher(payload),
    onSuccess: () => {
      toast.success("Registration submitted. Await admin approval.");
      navigate("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  });

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-10 shadow-soft backdrop-blur animate-rise reveal-1">
          <p className="text-xs uppercase tracking-[0.35em] text-brand/80">ApprovalHub</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink">Teacher onboarding, elevated.</h1>
          <p className="mt-4 text-sm text-slate">
            Create your teacher profile to approve students and manage AI-ready documents.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate">Approval flow</p>
              <p className="mt-2 text-sm text-ink">Review student registrations in one place.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate">Knowledge base</p>
              <p className="mt-2 text-sm text-ink">Upload documents and ask AI questions.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur animate-rise reveal-2">
          <h2 className="text-2xl font-semibold text-ink">Teacher Registration</h2>
          <p className="mt-2 text-sm text-slate">Create a teacher account for ApprovalHub.</p>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="mt-6 grid gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Name</label>
              <input {...register("name")} className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2" />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Email</label>
              <input {...register("email")} className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2" />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Phone</label>
              <input {...register("phone")} className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Password</label>
              <input
                type="password"
                {...register("password")}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Teacher Code</label>
                <input {...register("teacherCode")} className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2" />
                {errors.teacherCode && <p className="mt-1 text-xs text-rose-600">{errors.teacherCode.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate">Department</label>
                <input {...register("department")} className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2" />
              </div>
            </div>
            <button
              type="submit"
              className="mt-2 rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit Registration"}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate">
            <Link to="/login" className="text-brand">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
