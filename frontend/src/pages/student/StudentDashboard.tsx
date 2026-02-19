import { SimpleLayout } from "../../components/SimpleLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { Card } from "../../components/Card";
import { LoadingState } from "../../components/LoadingState";
import { useMutation, useQuery } from "@tanstack/react-query";
import { studentApi, StudentProfile, TeacherDocumentAskResponse } from "../../api/endpoints";
import toast from "react-hot-toast";
import { useState } from "react";

export function StudentDashboard() {
  const profileQuery = useQuery({
    queryKey: ["student", "me"],
    queryFn: async () => (await studentApi.me()).data
  });

  const profile = profileQuery.data as StudentProfile | undefined;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<TeacherDocumentAskResponse | null>(null);

  const askMutation = useMutation({
    mutationFn: async () => studentApi.askTeacherAi(question),
    onSuccess: (res) => setAnswer(res.data),
    onError: (err: any) => toast.error(err.response?.data?.message || "AI request failed")
  });

  return (
    <SimpleLayout title="Student Space" subtitle="Track your approval status and profile details.">
      {profileQuery.isLoading && <LoadingState />}
      {profile && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Profile Overview">
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold">Name:</span> {profile.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {profile.email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {profile.phone || "-"}
              </p>
              <p>
                <span className="font-semibold">Roll No:</span> {profile.rollNo}
              </p>
              <p>
                <span className="font-semibold">Class:</span> {profile.className || "-"}
              </p>
              <p>
                <span className="font-semibold">Section:</span> {profile.section || "-"}
              </p>
            </div>
          </Card>

          <Card title="Approval Status">
            <div className="space-y-3 text-sm text-slate-600">
              <StatusBadge status={profile.status} />
              <p>
                <span className="font-semibold">Assigned Teacher:</span> {profile.assignedTeacherName}
              </p>
              <p>
                <span className="font-semibold">Teacher Code:</span> {profile.assignedTeacherCode}
              </p>
            </div>
          </Card>

          <Card title="Ask Teacher AI">
            <p className="text-xs text-slate">Ask questions from your teacher's knowledge base.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-xs text-slate">
                Answers are based on {profile.assignedTeacherName}'s uploaded documents and notes.
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="Ask a question..."
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink"
              />
              <button
                onClick={() => askMutation.mutate()}
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
                disabled={!question.trim() || askMutation.isPending}
              >
                {askMutation.isPending ? "Thinking..." : "Ask AI"}
              </button>
            </div>
            {answer && (
              <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink">
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Answer</p>
                <p className="mt-2">{answer.answer}</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </SimpleLayout>
  );
}
