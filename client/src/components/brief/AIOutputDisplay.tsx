import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type AIOutput = {
  campaignTitle: string;
  headlines: string[];
  toneGuide: string;
  channels: { name: string; budgetPercent: number }[];
  visualDirection: string;
  keyMessages: string[];
};

type AIOutputDisplayProps = {
  briefData: {
    clientName: string;
  };
  aiOutput: AIOutput;
  onStartOver: () => void;
};

const ChannelBar = ({ name, percent }: { name: string; percent: number }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), 100);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="flex items-center gap-4 mb-3 last:mb-0">
      <span className="w-24 text-[12px] font-bold text-[var(--text-secondary)] shrink-0">{name}</span>
      <div className="flex-1 bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden relative border border-[var(--border)]/50">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-blue-500/20"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-10 text-[12px] font-black text-blue-600 text-right">{percent}%</span>
    </div>
  );
};

export const AIOutputDisplay: React.FC<AIOutputDisplayProps> = ({ briefData, aiOutput, onStartOver }) => {
  const exportPDF = async () => {
    const element = document.getElementById('brief-output');
    if (!element) return;
    
    // Use scale 2 for better quality
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`brief-${briefData.clientName}-${Date.now()}.pdf`);
  };

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)] mb-4 pl-3 border-l-2 border-blue-600">
      {children}
    </h3>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
      {/* Container for PDF generation */}
      <div 
        id="brief-output" 
        className="bg-white p-8 lg:p-14 rounded-2xl text-gray-900 shadow-2xl border border-gray-100 dark:border-none"
      >
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-10 mb-10">
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
            Strategy Document
          </p>
          <h2 className="text-3xl font-extrabold text-[#0f172a] leading-tight mb-4 tracking-tight">
            {aiOutput.campaignTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] text-gray-500 font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Client: {briefData.clientName}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Generated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="space-y-12">
          {/* Section 1: Headlines */}
          <section>
            <SectionHeading>Headline Direction</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {aiOutput.headlines.map((h, i) => (
                <div 
                  key={i} 
                  className="bg-blue-50/40 p-6 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center group hover:border-blue-300 transition-all cursor-default"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black mb-4 shadow-lg shadow-blue-600/20">
                    0{i + 1}
                  </div>
                  <p className="text-[15px] font-bold text-blue-900 leading-snug italic italic">"{h}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Channel Strategy & Tone */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
            <section>
              <SectionHeading>Budget Distribution</SectionHeading>
              <div className="space-y-4 mt-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                {aiOutput.channels.map((c, i) => (
                  <ChannelBar key={i} name={c.name} percent={c.budgetPercent} />
                ))}
              </div>
            </section>
            <section>
              <SectionHeading>Tone of Voice</SectionHeading>
              <div className="mt-6 p-6 bg-blue-50/30 rounded-xl border border-blue-100/50">
                <p className="text-[15px] font-medium text-gray-700 leading-relaxed italic">
                  {aiOutput.toneGuide}
                </p>
              </div>
            </section>
          </div>

          {/* Section 3: Visual Direction */}
          <section className="pt-4">
            <SectionHeading>Visual Direction</SectionHeading>
            <div className="mt-6 p-8 bg-gray-50/80 rounded-2xl border border-gray-100">
              <p className="text-[15px] font-medium text-gray-700 leading-loose max-w-4xl">
                {aiOutput.visualDirection}
              </p>
            </div>
          </section>

          {/* Section 4: Key Messages */}
          <section className="pt-4">
            <SectionHeading>Campaign Key Messages</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
              {aiOutput.keyMessages.map((m, i) => (
                <div key={i} className="flex gap-4 group">
                  <span className="text-3xl font-black text-blue-100 group-hover:text-blue-300 transition-colors">0{i+1}</span>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-[#0f172a] transition-colors leading-relaxed pt-2">
                    {m}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border)] shadow-xl gap-4">
        <button
          onClick={onStartOver}
          className="text-[var(--text-muted)] hover:text-blue-600 font-bold text-sm transition-all flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Start New Brief
        </button>
        <button
          onClick={exportPDF}
          className="w-full sm:w-auto px-10 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as PDF
        </button>
      </div>
    </div>
  );
};
