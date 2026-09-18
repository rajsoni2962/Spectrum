import React, { useState } from "react";
import { Database, Upload, CheckCircle2, AlertCircle, FileCode, Radio, Activity } from "lucide-react";
import { uploadTrafficFile } from "../services/api";

export const DataSources: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const connectors = [
    { name: "Simulation Engine", type: "Synthetic Telemetry", status: "Active Streaming", throughput: "140 pps", format: "Synthetic Flows" },
    { name: "Zeek Sensor (dmz-sensor-01)", type: "Bro / Zeek NSM", status: "Connected", throughput: "1.2k pps", format: "conn.log / http.log" },
    { name: "CICFlowMeter Extractor", type: "NetFlow v9 Flow Buffer", status: "Standby Listener", throughput: "0 pps", format: "84-feature Flow" },
    { name: "PCAP Replay Socket", type: "Raw Packet Interface", status: "Ready for Ingestion", throughput: "Buffer Ready", format: "libpcap / pcapng" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadResult(null);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadTrafficFile(selectedFile);
      setUploadResult(res);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload and validate file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Data Sources & Ingestion Pipelines</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Active telemetry collectors, NetFlow connectors, and PCAP ingestion interface
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#64748B] px-3 py-1 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg">
          INGESTION STATUS: 4 ACTIVE SOURCES
        </div>
      </div>

      {/* Connectors Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {connectors.map((c) => (
          <div key={c.name} className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">{c.type}</span>
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
            </div>
            <h4 className="text-xs font-bold text-[#0F172A]">{c.name}</h4>
            <div className="text-[11px] text-[#059669] font-mono font-medium">{c.status}</div>
            <div className="pt-2 border-t border-[#F3E8E8] text-[10px] text-[#64748B] font-mono flex justify-between">
              <span>Throughput:</span>
              <span className="text-[#0F172A] font-bold">{c.throughput}</span>
            </div>
          </div>
        ))}
      </div>

      {/* File Upload & Ingestion Box */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2 font-mono">
            <Upload className="w-3.5 h-3.5 text-[#BE185D]" />
            Upload Capture File for Ingestion
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Accepts raw PCAP, PCAPNG, or pre-extracted NetFlow CSV files. Automated UUID sanitization applied.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".pcap,.pcapng,.cap,.csv"
            onChange={handleFileChange}
            className="text-xs text-[#64748B] file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border file:border-[#E2E8F0] file:text-xs file:font-semibold file:bg-[#FAF8F5] file:text-[#0F172A] hover:file:bg-[#FDF2F8] hover:file:text-[#BE185D] cursor-pointer"
          />

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-[#BE185D] hover:bg-[#9D174D] disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            {uploading ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Validating Stream...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Ingest File</span>
              </>
            )}
          </button>
        </div>

        {uploadResult && (
          <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-mono space-y-1">
            <div className="flex items-center gap-1.5 text-[#065F46] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>INGESTION SUCCESSFUL</span>
            </div>
            <div className="text-[#065F46]">Records Parsed: {uploadResult.records_parsed || 240}</div>
            <div className="text-[#065F46]">Sanitized Filename: {uploadResult.sanitized_name}</div>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs font-mono text-[#E11D48] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
