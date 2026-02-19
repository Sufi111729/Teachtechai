import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { teacherApi, TeacherDocumentAskResponse, TeacherDocumentList, TeacherPendingStudent } from "../../api/endpoints";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { LoadingState } from "../../components/LoadingState";
import { Modal } from "../../components/Modal";
import { SimpleLayout } from "../../components/SimpleLayout";
import { StatCard } from "../../components/StatCard";
import { useAuthStore } from "../../store/auth";
import { useSearchParams } from "react-router-dom";

type ActionState =
  | { type: "approve" | "reject"; userId: number }
  | { type: "delete-doc"; documentId: number }
  | { type: "bulk-approve" | "bulk-reject"; userIds: number[] }
  | null;

export function TeacherDashboard() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [action, setAction] = useState<ActionState>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<TeacherDocumentAskResponse | null>(null);
  const [detailDocId, setDetailDocId] = useState<number | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "documents" | "ai" | "profile">("overview");
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", department: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "overview" || tab === "approvals" || tab === "documents" || tab === "ai" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const studentsQuery = useQuery({
    queryKey: ["teacher", "pending-students"],
    queryFn: async () => (await teacherApi.pendingStudents()).data
  });

  const profileQuery = useQuery({
    queryKey: ["teacher", "profile"],
    queryFn: async () => (await teacherApi.profile()).data
  });

  const documentsQuery = useQuery({
    queryKey: ["teacher", "documents"],
    queryFn: async () => (await teacherApi.listDocuments()).data
  });

  const aiHistoryQuery = useQuery({
    queryKey: ["teacher", "ai-history"],
    queryFn: async () => (await teacherApi.aiHistory()).data
  });

  const detailQuery = useQuery({
    queryKey: ["teacher", "document", detailDocId],
    queryFn: async () => (await teacherApi.getDocument(detailDocId as number)).data,
    enabled: !!detailDocId
  });

  const approveRejectMutation = useMutation({
    mutationFn: async () => {
      if (!action || action.type === "delete-doc") return;
      if (action.type === "approve") {
        return teacherApi.approveStudent(action.userId);
      }
      if (action.type === "reject") {
        return teacherApi.rejectStudent(action.userId);
      }
      if (action.type === "bulk-approve") {
        await Promise.all(action.userIds.map((id) => teacherApi.approveStudent(id)));
        return;
      }
      if (action.type === "bulk-reject") {
        await Promise.all(action.userIds.map((id) => teacherApi.rejectStudent(id)));
        return;
      }
    },
    onSuccess: () => {
      toast.success("Student updated");
      queryClient.invalidateQueries({ queryKey: ["teacher", "pending-students"] });
      setSelectedStudents(new Set());
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Action failed"),
    onSettled: () => setAction(null)
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("File missing");
      const form = new FormData();
      form.append("file", file);
      if (title) form.append("title", title);
      return teacherApi.uploadDocument(form);
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      setFile(null);
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["teacher", "documents"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Upload failed")
  });

  const noteMutation = useMutation({
    mutationFn: async () => {
      if (!noteForm.content.trim()) {
        throw new Error("Note content required");
      }
      return teacherApi.createNote({ title: noteForm.title, content: noteForm.content });
    },
    onSuccess: () => {
      toast.success("Note saved");
      setNoteForm({ title: "", content: "" });
      queryClient.invalidateQueries({ queryKey: ["teacher", "documents"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message || "Note save failed")
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!action || action.type !== "delete-doc") return;
      return teacherApi.deleteDocument(action.documentId);
    },
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["teacher", "documents"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Delete failed"),
    onSettled: () => setAction(null)
  });

  const askMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDoc) throw new Error("Select a document");
      return teacherApi.askDocument(selectedDoc, question);
    },
    onSuccess: (res) => {
      setAnswer(res.data);
      queryClient.invalidateQueries({ queryKey: ["teacher", "ai-history"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Ask failed")
  });

  const selectedDocument = useMemo(() => {
    return (documentsQuery.data || []).find((doc) => doc.id === selectedDoc) || null;
  }, [documentsQuery.data, selectedDoc]);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.toLowerCase();
    return (studentsQuery.data || []).filter((student: TeacherPendingStudent) =>
      [student.name, student.email, student.rollNo, student.className, student.section]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [studentsQuery.data, studentSearch]);

  const allSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents.has(s.userId));

  const totalChunks = useMemo(() => {
    return (documentsQuery.data || []).reduce((sum: number, doc: TeacherDocumentList) => sum + (doc.chunkCount || 0), 0);
  }, [documentsQuery.data]);

  const latestDocument = useMemo(() => {
    return (documentsQuery.data || []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
  }, [documentsQuery.data]);

  useEffect(() => {
    if (profileQuery.data) {
      setProfileForm({
        name: profileQuery.data.name || "",
        phone: profileQuery.data.phone || "",
        department: profileQuery.data.department || ""
      });
    }
  }, [profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => teacherApi.updateProfile(profileForm),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["teacher", "profile"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Update failed")
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async () => {
      if (!avatarFile) throw new Error("Avatar file missing");
      return teacherApi.uploadAvatar(avatarFile);
    },
    onSuccess: () => {
      toast.success("Avatar updated");
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ["teacher", "profile"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Avatar upload failed")
  });

  return (
    <SimpleLayout title="Teacher Command Desk" subtitle="Approve students, manage knowledge, and unlock AI insights.">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { id: "overview", label: "Overview" },
          { id: "approvals", label: "Approvals" },
          { id: "documents", label: "Documents" },
          { id: "ai", label: "AI Studio" },
          { id: "profile", label: "Profile" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              const next = tab.id as typeof activeTab;
              setActiveTab(next);
              setSearchParams({ tab: next });
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
              activeTab === tab.id ? "bg-brand text-white" : "bg-white/70 text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] animate-rise reveal-1">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate">Overview</p>
              <h2 className="text-3xl font-semibold text-ink">Stay ahead of approvals.</h2>
              <p className="text-sm text-slate">
                Track pending students, document uploads, and AI answers in one cockpit.
              </p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate">
              <p className="text-xs uppercase tracking-[0.3em] text-slate">Latest Document</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {latestDocument ? latestDocument.title || latestDocument.fileName : "No uploads yet"}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Pending Students" value={studentsQuery.data?.length ?? 0} helper="Awaiting your review" />
            <StatCard label="Documents" value={documentsQuery.data?.length ?? 0} helper={`${totalChunks} chunks indexed`} />
            <StatCard label="AI Answers" value={answer ? 1 : 0} helper="Latest session" />
          </div>
        </Card>

        <Card title="Teacher Profile">
          {profileQuery.isLoading && <LoadingState />}
          {profileQuery.data && (
            <div className="space-y-3 text-sm text-slate">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Status</p>
                <StatusBadge status={profileQuery.data.status} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Name</p>
                <p className="text-base font-semibold text-ink">{profileQuery.data.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Email</p>
                <p className="text-base text-ink">{profileQuery.data.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Phone</p>
                <p className="text-base text-ink">{profileQuery.data.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Teacher Code</p>
                <p className="text-base text-ink">{profileQuery.data.teacherCode}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Department</p>
                <p className="text-base text-ink">{profileQuery.data.department || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Joined</p>
                <p className="text-base text-ink">{new Date(profileQuery.data.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          {!profileQuery.isLoading && !profileQuery.data && (
            <div className="space-y-3 text-sm text-slate">
              <p className="text-xs uppercase tracking-[0.25em] text-slate">Name</p>
              <p className="text-base font-semibold text-ink">{user?.name || "Teacher"}</p>
            </div>
          )}
        </Card>
      </div>
      )}

      {activeTab === "approvals" && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] animate-rise reveal-2">
        <Card title="Pending Students">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search by name, email, roll no"
              className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-ink md:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  setAction({
                    type: "bulk-approve",
                    userIds: Array.from(selectedStudents)
                  })
                }
                className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 disabled:opacity-50"
                disabled={selectedStudents.size === 0}
              >
                Bulk Approve
              </button>
              <button
                onClick={() =>
                  setAction({
                    type: "bulk-reject",
                    userIds: Array.from(selectedStudents)
                  })
                }
                className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-800 disabled:opacity-50"
                disabled={selectedStudents.size === 0}
              >
                Bulk Reject
              </button>
            </div>
            <div className="ml-auto text-xs uppercase tracking-[0.25em] text-slate">
              {filteredStudents.length} results
            </div>
          </div>
          {studentsQuery.isLoading && <LoadingState />}
          {!studentsQuery.isLoading && filteredStudents.length === 0 && (
            <EmptyState title="No pending students" description="All assigned students are reviewed." />
          )}
          {filteredStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.25em] text-slate">
                  <tr>
                    <th className="py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(new Set(filteredStudents.map((s) => s.userId)));
                          } else {
                            setSelectedStudents(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="py-3">Student</th>
                    <th>Contact</th>
                    <th>Roll</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student: TeacherPendingStudent) => (
                    <tr key={student.userId} className="border-t border-white/60">
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.userId)}
                          onChange={(e) => {
                            setSelectedStudents((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) {
                                next.add(student.userId);
                              } else {
                                next.delete(student.userId);
                              }
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td className="py-4">
                        <p className="font-semibold text-ink">{student.name}</p>
                        <p className="text-xs text-slate">
                          {student.className || "-"} {student.section || ""}
                        </p>
                      </td>
                      <td>
                        <p>{student.email}</p>
                        <p className="text-xs text-slate">{student.phone || "-"}</p>
                      </td>
                      <td>{student.rollNo}</td>
                      <td>
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setAction({ type: "approve", userId: student.userId })}
                            className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setAction({ type: "reject", userId: student.userId })}
                            className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-800"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Upload Document">
          <p className="text-xs text-slate">PDF, DOCX, or image up to 20MB</p>
          <div className="mt-4 grid gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title"
              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-ink"
            />
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <button
              onClick={() => uploadMutation.mutate()}
              className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
              disabled={uploadMutation.isPending || !file}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </button>
          </div>
        </Card>
      </div>
      )}

      {activeTab === "documents" && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] animate-rise reveal-3">
          <Card title="Document Library">
          {documentsQuery.isLoading && <LoadingState />}
          {!documentsQuery.isLoading && (documentsQuery.data || []).length === 0 && (
            <EmptyState title="No documents" description="Upload a PDF or DOCX to start." />
          )}
          {(documentsQuery.data || []).length > 0 && (
            <div className="mt-2 space-y-3">
              {(documentsQuery.data || []).map((doc: TeacherDocumentList) => (
                <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{doc.title || doc.fileName}</p>
                    <p className="text-xs text-slate">
                      {new Date(doc.createdAt).toLocaleDateString()} • {doc.chunkCount} chunks
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDoc(doc.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedDoc === doc.id ? "bg-brand text-white" : "bg-white/80 text-ink"
                      }`}
                    >
                      Select
                    </button>
                    <button
                      onClick={() => setDetailDocId(doc.id)}
                      className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setAction({ type: "delete-doc", documentId: doc.id })}
                      className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-6">
          <Card title="Document Insights">
            <p className="text-xs text-slate">Select a document to view details or jump to AI Studio.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink">
                {selectedDocument ? selectedDocument.title || selectedDocument.fileName : "No document selected"}
              </div>
              <button
                onClick={() => {
                  setActiveTab("ai");
                  setSearchParams({ tab: "ai" });
                }}
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
                disabled={!selectedDoc}
              >
                Ask AI About Selected Document
              </button>
            </div>
          </Card>

          <Card title="Add Notes">
            <p className="text-xs text-slate">Write plain text knowledge and save it to your AI library.</p>
            <div className="mt-4 space-y-3">
              <input
                value={noteForm.title}
                onChange={(e) => setNoteForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Optional title"
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-ink"
              />
              <textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={6}
                placeholder="Paste or write your notes here..."
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink"
              />
              <button
                onClick={() => noteMutation.mutate()}
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
                disabled={noteMutation.isPending}
              >
                {noteMutation.isPending ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </Card>
        </div>
      </div>
      )}

      {activeTab === "ai" && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] animate-rise reveal-3">
          <Card title="Ask Document AI">
            <p className="text-xs text-slate">Select a document and ask a question.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink">
                {selectedDocument ? selectedDocument.title || selectedDocument.fileName : "No document selected"}
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="Ask about the document content..."
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink"
              />
              <button
                onClick={() => askMutation.mutate()}
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
                disabled={!selectedDoc || askMutation.isPending}
              >
                {askMutation.isPending ? "Thinking..." : "Ask AI"}
              </button>
            </div>

            {answer && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Answer</p>
                  <p className="mt-2 text-ink">{answer.answer}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Used Chunks</p>
                  <div className="mt-2 space-y-2">
                    {answer.usedChunks.map((chunk) => (
                      <div key={chunk.chunkIndex} className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs text-ink">
                        <span className="font-semibold">Chunk {chunk.chunkIndex}:</span> {chunk.preview}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
          <Card title="AI Tips">
            <ul className="space-y-3 text-sm text-slate">
              <li>Use specific questions for better answers.</li>
              <li>Upload structured documents for faster indexing.</li>
              <li>Chunk selection happens automatically.</li>
            </ul>
            {aiHistoryQuery.data && aiHistoryQuery.data.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate">Recent Q&A</p>
                {aiHistoryQuery.data.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs text-ink">
                    <p className="font-semibold">{item.documentTitle || "Document"}</p>
                    <p className="mt-1 text-slate">Q: {item.question}</p>
                    <p className="mt-1">A: {item.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] animate-rise reveal-2">
          <Card title="Teacher Profile">
            {profileQuery.isLoading && <LoadingState />}
            {profileQuery.data && (
              <div className="space-y-3 text-sm text-slate">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Status</p>
                  <StatusBadge status={profileQuery.data.status} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-white/70 bg-white/70">
                    {profileQuery.data.avatarUrl ? (
                      <img src={profileQuery.data.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate">
                        {profileQuery.data.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate">Profile</p>
                    <p className="text-base font-semibold text-ink">{profileQuery.data.name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Name</p>
                  <p className="text-base font-semibold text-ink">{profileQuery.data.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Email</p>
                  <p className="text-base text-ink">{profileQuery.data.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Phone</p>
                  <p className="text-base text-ink">{profileQuery.data.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Teacher Code</p>
                  <p className="text-base text-ink">{profileQuery.data.teacherCode}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Department</p>
                  <p className="text-base text-ink">{profileQuery.data.department || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate">Joined</p>
                  <p className="text-base text-ink">{new Date(profileQuery.data.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </Card>
          <Card title="Edit Profile">
            <div className="grid gap-3 text-sm text-slate">
              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-slate">Avatar</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    className="text-sm"
                  />
                  <button
                    onClick={() => uploadAvatarMutation.mutate()}
                    className="rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink"
                    disabled={uploadAvatarMutation.isPending || !avatarFile}
                  >
                    {uploadAvatarMutation.isPending ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-slate">Name</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-slate">Phone</label>
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.25em] text-slate">Department</label>
                <input
                  value={profileForm.department}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm text-ink"
                />
              </div>
              <button
                onClick={() => updateProfileMutation.mutate()}
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmModal
        open={!!action}
        title={
          action?.type === "delete-doc"
            ? "Delete document"
            : action?.type === "approve"
            ? "Approve student"
            : action?.type === "bulk-approve"
            ? "Approve selected students"
            : "Reject student"
        }
        description={
          action?.type === "delete-doc"
            ? "This will permanently delete the document and its chunks."
            : action?.type === "bulk-approve"
            ? "This will approve all selected students."
            : action?.type === "bulk-reject"
            ? "This will reject all selected students."
            : "This action will update the student status immediately."
        }
        confirmLabel={
          action?.type === "delete-doc"
            ? "Delete"
            : action?.type === "approve"
            ? "Approve"
            : action?.type === "bulk-approve"
            ? "Approve All"
            : action?.type === "bulk-reject"
            ? "Reject All"
            : "Reject"
        }
        onClose={() => setAction(null)}
        onConfirm={() => {
          if (!action) return;
          if (action.type === "delete-doc") {
            deleteMutation.mutate();
          } else {
            approveRejectMutation.mutate();
          }
        }}
      />

      <Modal open={!!detailDocId} title="Document Details" onClose={() => setDetailDocId(null)}>
        {detailQuery.isLoading && <LoadingState />}
        {detailQuery.data && (
          <div className="space-y-2 text-sm text-slate">
            <p>
              <span className="font-semibold">Title:</span> {detailQuery.data.title || "-"}
            </p>
            <p>
              <span className="font-semibold">File:</span> {detailQuery.data.fileName}
            </p>
            <p>
              <span className="font-semibold">Type:</span> {detailQuery.data.mimeType}
            </p>
            <p>
              <span className="font-semibold">Size:</span> {Math.round(detailQuery.data.fileSize / 1024)} KB
            </p>
            <p>
              <span className="font-semibold">Chunks:</span> {detailQuery.data.chunkCount}
            </p>
            <p>
              <span className="font-semibold">Uploaded:</span> {new Date(detailQuery.data.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
    </SimpleLayout>
  );
}
