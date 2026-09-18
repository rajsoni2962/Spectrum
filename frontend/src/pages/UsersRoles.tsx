import React from "react";
import { Users, Shield, KeyRound, CheckCircle2, UserCheck } from "lucide-react";

export const UsersRoles: React.FC = () => {
  const users = [
    { username: "admin", name: "SOC Lead Administrator", email: "admin@spectrum.internal", role: "Admin", status: "Active", permissions: "Full System & Security Configuration" },
    { username: "analyst", name: "Tier-2 SOC Analyst", email: "analyst@spectrum.internal", role: "SOC Analyst", status: "Active", permissions: "Alert Triage, Case Management, Note Audit" },
    { username: "manager", name: "SecOps Operations Manager", email: "manager@spectrum.internal", role: "Security Manager", status: "Active", permissions: "Reporting, Playbook Sign-off, Escalation" },
    { username: "viewer", name: "Compliance Auditor", email: "auditor@spectrum.internal", role: "Viewer", status: "Active", permissions: "Read-Only Telemetry & Dashboard Inspection" },
  ];

  const roles = [
    { role: "Admin", count: 1, desc: "Root platform configuration, API key generation, sensor lifecycle" },
    { role: "Security Manager", count: 1, desc: "Executive briefings, compliance reporting, incident sign-offs" },
    { role: "SOC Analyst", count: 4, desc: "Continuous live queue triage, forensic investigation, playbook triggering" },
    { role: "Viewer", count: 2, desc: "Read-only observer role for executive leadership and audit personnel" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Users & Access Roles</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Role-based access control (RBAC), operator entitlement matrix, and credential lifecycle
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#64748B] px-3 py-1 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg font-medium">
          RBAC: STRICT ENFORCEMENT
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map((r) => (
          <div key={r.role} className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#BE185D]">{r.role}</span>
              <span className="text-[11px] font-mono text-[#64748B]">{r.count} users</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            Active SOC Personnel & Operators
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#F3E8E8] text-[11px] text-[#64748B] uppercase bg-[#FAF8F5]/50">
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Entitlements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {users.map((u) => (
                <tr key={u.username} className="hover:bg-[#FDF2F8]/60 transition-colors">
                  <td className="py-2.5 px-3 text-[#BE185D] font-bold">{u.username}</td>
                  <td className="py-2.5 px-3 text-[#0F172A] font-sans font-medium">{u.name}</td>
                  <td className="py-2.5 px-3 text-[#64748B]">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-md text-[10px] text-[#0F172A] font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#059669] font-semibold">{u.status}</td>
                  <td className="py-2.5 px-3 text-[#64748B] font-sans text-[11px]">{u.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
