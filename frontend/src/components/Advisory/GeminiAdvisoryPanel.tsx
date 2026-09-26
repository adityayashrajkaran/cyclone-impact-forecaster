import React, { useState } from 'react';
import type { CycloneTrack, AdvisoryResponse, AdvisoryRequest } from '../../types';
import { generateGeminiAdvisory } from '../../services/api';
import { Download, Volume2, Send, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface GeminiAdvisoryPanelProps {
  cyclone: CycloneTrack;
  peakSurge: number;
}

export const GeminiAdvisoryPanel: React.FC<GeminiAdvisoryPanelProps> = ({ cyclone, peakSurge }) => {
  const [district, setDistrict] = useState('Jagatsinghpur & Bhadrak (Odisha)');
  const [language, setLanguage] = useState('English');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const landfallPoint = cyclone.points[cyclone.points.length - 1];

  const handleGenerateAdvisory = async () => {
    setLoading(true);
    const req: AdvisoryRequest = {
      cyclone_name: cyclone.name,
      target_district: district,
      landfall_eta_hours: 18.0,
      max_wind_speed: landfallPoint.max_wind_kmh,
      predicted_surge_m: peakSurge,
      impacted_infra_count: 8,
      language: language,
      api_key: apiKey ? apiKey : undefined
    };

    const res = await generateGeminiAdvisory(req);
    setAdvisory(res);
    setLoading(false);
  };

  const handleSpeakAlert = () => {
    if (!advisory) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(advisory.public_broadcast_alert);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDownloadPDF = () => {
    if (!advisory) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("RESILITRACK CYCLONE AI - EMERGENCY DISPATCH", 14, 18);
    doc.setFontSize(10);
    doc.text(`Powered by Gemini 3.7 Flash Reasoning • ${advisory.generated_at}`, 14, 26);

    let y = 45;

    // Title & Severity
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(14);
    doc.text(advisory.severity_badge, 14, y);
    y += 8;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(advisory.title, 14, y, { maxWidth: 180 });
    y += 15;

    // Summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("EXECUTIVE SUMMARY FOR MUNICIPAL & NDMA AUTHORITIES:", 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(advisory.summary, 180);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 6 + 6;

    // Evacuation Instructions
    doc.setFont('helvetica', 'bold');
    doc.text("EVACUATION MANDATES:", 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    advisory.evacuation_zone_instructions.forEach((inst, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${inst}`, 175);
      doc.text(lines, 18, y);
      y += lines.length * 5 + 2;
    });

    y += 4;

    // Infrastructure Hardening
    doc.setFont('helvetica', 'bold');
    doc.text("INFRASTRUCTURE HARDENING PRIORITIES:", 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    advisory.infrastructure_hardening_priorities.forEach((prior) => {
      const lines = doc.splitTextToSize(`• ${prior}`, 175);
      doc.text(lines, 18, y);
      y += lines.length * 5 + 2;
    });

    y += 4;

    // Public Alert
    doc.setFillColor(254, 242, 242);
    doc.rect(14, y, 182, 24, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text("PUBLIC BROADCAST WARNING (RADIO/TV/SMS):", 18, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const alertLines = doc.splitTextToSize(advisory.public_broadcast_alert, 174);
    doc.text(alertLines, 18, y + 14);

    doc.save(`ResiliTrack_Gemini_Advisory_${cyclone.name.replace(/\s+/g, '_')}_${advisory.district.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Dispatch Controls Panel */}
      <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-300/60 pb-3">
          <h2 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase">
            Early-Warning Emergency Advisory Generator
          </h2>
          <span className="text-[11px] font-mono text-slate-700 font-bold bg-[#e6ecf5] shadow-[inset_2px_2px_4px_#c2d0e3,inset_-2px_-2px_4px_#ffffff] px-2.5 py-1 rounded-xl">
            Gemini 3.7 Multimodal Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-700 block font-bold mb-1">Target Sector</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] text-slate-900 font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="Jagatsinghpur & Bhadrak (Odisha)">Jagatsinghpur & Bhadrak (Odisha)</option>
              <option value="Purba Medinipur (Digha - West Bengal)">Purba Medinipur (West Bengal)</option>
              <option value="South 24 Parganas (Sundarbans Delta)">South 24 Parganas (Sundarbans)</option>
              <option value="Cox's Bazar & Chattogram (Bangladesh)">Cox's Bazar & Chattogram</option>
              <option value="Kolkata Metropolitan District">Kolkata Metro Area</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 block font-bold mb-1">Bulletin Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] text-slate-900 font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 block font-bold mb-1">API Key (Optional)</label>
            <input
              type="password"
              placeholder="AIzaSy... (optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] text-slate-900 font-mono rounded-xl px-3 py-2 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateAdvisory}
          disabled={loading}
          className="w-full bg-[#e6ecf5] shadow-[4px_4px_8px_#c2d0e3,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] text-slate-900 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Synthesizing Satellite Feeds...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Generate Early-Warning Advisory Bulletin
            </>
          )}
        </button>
      </div>

      {/* Generated Advisory Document Bulletin */}
      {advisory ? (
        <div className="bg-[#e6ecf5] shadow-[6px_6px_14px_#c2d0e3,-6px_-6px_14px_#ffffff] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#e6ecf5] shadow-[inset_2px_2px_4px_#c2d0e3,inset_-2px_-2px_4px_#ffffff] text-rose-700 font-mono text-xs px-3 py-1 rounded-full font-bold">
                {advisory.severity_badge}
              </span>
              <span className="text-xs text-slate-600 font-mono font-bold">{advisory.generated_at}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <button
                onClick={handleSpeakAlert}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] text-slate-900'
                    : 'bg-[#e6ecf5] shadow-[3px_3px_6px_#c2d0e3,-3px_-3px_6px_#ffffff] text-slate-700'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isPlayingAudio ? 'Broadcasting...' : 'Audio Broadcast'}
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e6ecf5] shadow-[4px_4px_8px_#c2d0e3,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] text-slate-900 font-extrabold cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{advisory.title}</h3>
            <div className="text-xs text-slate-800 bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] p-4 rounded-xl leading-relaxed font-medium">
              {advisory.summary}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] rounded-xl p-4 space-y-2">
              <div className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider">Evacuation Mandates</div>
              <ul className="space-y-1.5 text-slate-800 font-medium">
                {advisory.evacuation_zone_instructions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-mono text-slate-500 font-bold">{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] rounded-xl p-4 space-y-2">
              <div className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider">Infrastructure Hardening</div>
              <ul className="space-y-1.5 text-slate-800 font-medium">
                {advisory.infrastructure_hardening_priorities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] rounded-xl p-4 space-y-2">
              <div className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider">Resource Deployment</div>
              <ul className="space-y-1.5 text-slate-800 font-medium">
                {advisory.resource_allocation_plan.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#e6ecf5] shadow-[inset_2px_2px_5px_#c2d0e3,inset_-2px_-2px_5px_#ffffff] rounded-xl p-4 text-xs space-y-1">
            <div className="font-extrabold text-rose-800 uppercase text-[11px] tracking-wider">Public Emergency Warning</div>
            <p className="text-rose-900 italic font-bold leading-relaxed">"{advisory.public_broadcast_alert}"</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#e6ecf5] shadow-[inset_3px_3px_6px_#c2d0e3,inset_-3px_-3px_6px_#ffffff] rounded-2xl p-8 text-center text-xs text-slate-600 font-semibold">
          Click 'Generate Early-Warning Advisory Bulletin' to produce localized EOC directives.
        </div>
      )}
    </div>
  );
};
