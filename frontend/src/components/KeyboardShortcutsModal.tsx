import React, { useEffect } from "react";
import { X, Keyboard, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "Global Navigation (Press G then Key)",
      shortcuts: [
        { keys: ["G", "D"], label: "Command Center (Dashboard)" },
        { keys: ["G", "F"], label: "Threat Forecast & Predictive AI" },
        { keys: ["G", "A"], label: "Alerts Triage Queue" },
        { keys: ["G", "I"], label: "Incident Dossiers" },
        { keys: ["G", "M"], label: "MITRE ATT&CK Matrix" },
        { keys: ["G", "W"], label: "Forensic Workbench (Investigation)" },
        { keys: ["G", "N"], label: "Network Topology & Blast Radius" },
        { keys: ["G", "L"], label: "Live Telemetry Ingress Monitor" },
        { keys: ["G", "S"], label: "Adversary Simulation Lab" },
        { keys: ["G", "H"], label: "System Diagnostics & Health" },
      ],
    },
    {
      title: "Command & Search",
      shortcuts: [
        { keys: ["Ctrl", "K"], label: "Open Universal Command Palette" },
        { keys: ["?"], label: "Open Keyboard Shortcuts Help" },
        { keys: ["["], label: "Toggle Contextual Navigation Sidebar" },
        { keys: ["Esc"], label: "Close Modal / Cancel Action" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-lg bg-white border border-[#F3E8E8] rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            <Keyboard className="w-4 h-4 text-[#BE185D]" />
            <span>SPECTRUM Demo Console Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] font-semibold">
                {group.title}
              </div>
              <div className="bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg divide-y divide-[#E2E8F0]">
                {group.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between px-3.5 py-2 text-xs"
                  >
                    <span className="text-[#475569]">{sc.label}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-[10px] font-mono text-[#0F172A] shadow-xs font-semibold"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span>Press ESC anytime to exit</span>
          <span className="text-[#BE185D] font-semibold">Fast Ops Navigation</span>
        </div>
      </div>
    </div>
  );
};
