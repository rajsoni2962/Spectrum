import React from "react";
import { Download, FileSpreadsheet, FileCode, Database, CheckCircle2 } from "lucide-react";

export const ExportCenter: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Export Center & Data Warehouse</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Bulk telemetry extraction, JSON forecast schemas, and relational database exports
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#BE185D] px-3 py-1 bg-[#FDF2F8] border border-[#FCE7F3] rounded-lg font-semibold">
          EXPORTS: ENCRYPTED & SANITIZED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSV Export */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 flex flex-col justify-between space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Traffic Flow Records (CSV)</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Export filtered network telemetry flows, packet statistics, flags, and risk assessments in standardized CSV format.
            </p>
          </div>

          <div>
            <a
              href="/api/v1/reports/export/csv"
              download="spectrum_traffic_export.csv"
              className="w-full py-2.5 bg-[#BE185D] hover:bg-[#9D174D] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Telemetry CSV
            </a>
          </div>
        </div>

        {/* JSON Export */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 flex flex-col justify-between space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D]">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Forecast & SHAP Schema (JSON)</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Export full temporal forecasting feature vectors, SHAP attribution trees, and class probability distributions.
            </p>
          </div>

          <div>
            <a
              href="/api/v1/forecast/current"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export Forecast JSON
            </a>
          </div>
        </div>

        {/* SQL Schema DDL */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 flex flex-col justify-between space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E2E8F0] flex items-center justify-center text-[#D97706]">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">PostgreSQL Schema DDL (SQL)</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Production DDL script establishing all 16 normalized relational SOC schemas with primary keys, indexes, and constraints.
            </p>
          </div>

          <div>
            <a
              href="/api/v1/reports/export/ddl"
              download="init_schema.sql"
              className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Schema DDL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
