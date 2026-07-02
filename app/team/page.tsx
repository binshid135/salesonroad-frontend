"use client";

import { useEffect, useState } from "react";
import { AppShell, EmptyState, PageHeader, PlusIcon, StatusBadge } from "@/components/AppShell";
import { teamAPI, User } from "@/lib/api";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-900/15 transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60";
const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-black text-purple-800 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#130824] outline-none transition placeholder:text-[#9c92aa] focus:border-purple-400 focus:ring-4 focus:ring-purple-100";
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-wide text-[#6d6478]";
const tableWrapClass = "overflow-x-auto rounded-2xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(54,22,92,0.08)]";
const thClass = "bg-purple-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-[#6d6478]";
const tdClass = "px-4 py-3 text-[#130824]";
const modalBackdropClass = "fixed inset-0 z-50 grid place-items-center bg-[#130824]/55 p-4 backdrop-blur-sm";
const modalClass = "max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl shadow-purple-950/25 sm:p-5";
const alertErrorClass = "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700";
const alertSuccessClass = "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700";

export default function TeamPage() {
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [inviteResult, setInviteResult] = useState<{ message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchTeam = () => {
    setLoading(true);
    teamAPI
      .list()
      .then((res) => setTeam(res.data))
      .finally(() => setLoading(false));
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    const data = (err as { response?: { data?: { detail?: string } } })?.response?.data;
    return data?.detail || fallback;
  };

  useEffect(() => {
    let cancelled = false;

    teamAPI
      .list()
      .then((res) => {
        if (!cancelled) setTeam(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setInviteResult(null);
    try {
      const res = await teamAPI.invite(email, fullName, password);
      setInviteResult(res.data);
      fetchTeam();
      setEmail("");
      setFullName("");
      setPassword("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to add salesman."));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (member: User) => {
    setEditingMember(member);
    setEditEmail(member.email);
    setEditFullName(member.full_name || "");
    setEditPassword("");
    setEditActive(member.is_active);
    setError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setSaving(true);
    setError("");
    try {
      await teamAPI.update(editingMember.id, {
        email: editEmail,
        full_name: editFullName,
        is_active: editActive,
        ...(editPassword ? { password: editPassword } : {}),
      });
      setEditingMember(null);
      fetchTeam();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update salesman."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: User) => {
    if (!window.confirm(`Delete ${member.full_name || member.email}? This cannot be undone.`)) return;

    setDeletingId(member.id);
    setError("");
    try {
      await teamAPI.delete(member.id);
      fetchTeam();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete salesman."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Team"
        subtitle="Add, edit, and manage the salesmen who can access your company workspace."
        actions={
          <button
            onClick={() => {
              setShowInvite(true);
              setInviteResult(null);
              setError("");
            }}
            className={`${buttonPrimary} w-full sm:w-auto`}
          >
            <PlusIcon /> Add Salesman
          </button>
        }
      />

      {error && !showInvite && !editingMember && <div className={`${alertErrorClass} mb-4`}>{error}</div>}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-purple-100/70" />
          ))}
        </div>
      ) : team.length === 0 ? (
        <EmptyState title="No team members yet" body="Add a salesman to begin assigning field orders." />
      ) : (
        <div className={tableWrapClass}>
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {["Name", "Email", "Role", "Status", "Actions"].map((heading) => (
                  <th key={heading} className={thClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7f8]">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-purple-50/50">
                  <td className={`${tdClass} font-bold`}>{member.full_name || "-"}</td>
                  <td className={`${tdClass} text-[#6d6478]`}>{member.email}</td>
                  <td className={`${tdClass} capitalize text-[#6d6478]`}>{member.role.replace("_", " ")}</td>
                  <td className={tdClass}>
                    <StatusBadge tone={member.is_active ? "success" : "danger"}>
                      {member.is_active ? "Active" : "Inactive"}
                    </StatusBadge>
                  </td>
                  <td className={tdClass}>
                    {member.role === "salesman" ? (
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(member)} className="text-xs font-bold text-purple-700">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
                          disabled={deletingId === member.id}
                          className="text-xs font-bold text-red-600 disabled:opacity-50"
                        >
                          {deletingId === member.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#6d6478]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <div className={modalBackdropClass}>
          <div className={modalClass}>
            <h2 className="mb-4 text-lg font-black text-[#130824]">Add Salesman</h2>
            {error && <div className={`${alertErrorClass} mb-4`}>{error}</div>}

            {inviteResult ? (
              <div className="space-y-4">
                <div className={alertSuccessClass}>
                  <p className="mb-1 font-bold">Salesman created!</p>
                  <p>{inviteResult.message || "The salesman can now sign in with the password you set."}</p>
                </div>
                <button onClick={() => setShowInvite(false)} className={`${buttonPrimary} w-full`}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-3">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Ahmed Hassan" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ahmed@company.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" className={inputClass} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className={`${buttonPrimary} flex-1`}>
                    {saving ? "Adding..." : "Add"}
                  </button>
                  <button type="button" onClick={() => setShowInvite(false)} className={`${buttonSecondary} flex-1`}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {editingMember && (
        <div className={modalBackdropClass}>
          <div className={modalClass}>
            <h2 className="mb-4 text-lg font-black text-[#130824]">Edit Salesman</h2>
            {error && <div className={`${alertErrorClass} mb-4`}>{error}</div>}
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className={labelClass}>Full Name</label>
                <input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} minLength={8} placeholder="Leave blank to keep current" className={inputClass} />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3f]">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="h-4 w-4 rounded border-[#c7b7e6] text-purple-700 focus:ring-purple-500"
                />
                Active account
              </label>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className={`${buttonPrimary} flex-1`}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setEditingMember(null)} className={`${buttonSecondary} flex-1`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
