import React, { useState } from 'react';
import { X, Download, FileText, Calendar, MapPin, User, Shield, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';

interface Detection {
  id: string;
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  description: string;
  forensicSignificance: string;
}

interface AnalysisResult {
  detections: Detection[];
  imageUrl: string;
  timestamp: string;
  metadata: {
    resolution: string;
    fileSize: string;
    format: string;
  };
}

interface ForensicReportProps {
  result: AnalysisResult;
  onClose: () => void;
}

const ForensicReport: React.FC<ForensicReportProps> = ({ result, onClose }) => {
  const caseNumber = `CASE-${Date.now().toString().slice(-8)}`;
  const reportDate = new Date().toLocaleDateString();
  const analysisTime = new Date(result.timestamp).toLocaleString();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [crimeSceneLocation, setCrimeSceneLocation] = useState('');
  const [investigatorName, setInvestigatorName] = useState('');
  const [showInputs, setShowInputs] = useState(false);

const downloadPDF = async () => {

  if (!crimeSceneLocation.trim() || !investigatorName.trim()) {
    setShowInputs(true);
    return;
  }

  setIsGeneratingPDF(true);

  try {

    const pdf = new jsPDF("p","mm","a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 15;
    let yPosition = margin;

    /* ---------------- WATERMARK ---------------- */

    const addWatermark = () => {

      pdf.saveGraphicsState();

      pdf.setTextColor(240,240,240);
      pdf.setFont("helvetica","bold");
      pdf.setFontSize(40);

   pdf.text(
  "TEAM INVESTIGATOR",
  pageWidth/2,
  pageHeight/2,
  {
    align:"center",
    angle:45,
    maxWidth:180
  }
);

      pdf.restoreGraphicsState();
    };

    addWatermark();

    const checkNewPage = (height) => {
      if (yPosition + height > pageHeight - margin) {
        pdf.addPage();
        addWatermark();
        yPosition = margin;
      }
    };



    /* ---------------- BOX SECTION FUNCTION ---------------- */

    const addBoxSection = (title, content) => {

      const padding = 6;
      const lineHeight = 6;

      const boxHeight = content.length * lineHeight + padding * 2 + 10;

      checkNewPage(boxHeight);

      pdf.setFillColor(245,248,252);
      pdf.rect(margin,yPosition,pageWidth-margin*2,boxHeight,"F");

      pdf.setDrawColor(0,100,200);
      pdf.rect(margin,yPosition,pageWidth-margin*2,boxHeight);

      let textY = yPosition + padding + 4;

      pdf.setFont("helvetica","bold");
      pdf.setFontSize(12);
      pdf.setTextColor(0,102,204);

      pdf.text(title,margin+4,textY);

      textY += 8;

      pdf.setFont("helvetica","normal");
      pdf.setFontSize(10);
      pdf.setTextColor(0,0,0);

      content.forEach(line=>{
        pdf.text(line,margin+4,textY);
        textY += lineHeight;
      });

      yPosition += boxHeight + 10;
    };



    /* ---------------- EVIDENCE TABLE ---------------- */

    const addEvidenceTable = (detections) => {

      const colX = [
        margin,
        margin+20,
        margin+60,
        margin+100,
        margin+140
      ];

      const rowHeight = 6;

      checkNewPage(20);

      pdf.setFont("helvetica","bold");
      pdf.setFontSize(12);

      pdf.text("DETAILED EVIDENCE CATALOG",margin,yPosition);

      yPosition += 8;

      pdf.setFillColor(0,100,200);
      pdf.rect(margin,yPosition-5,pageWidth-margin*2,8,"F");

      pdf.setTextColor(255,255,255);
      pdf.setFontSize(9);

      pdf.text("ID",colX[0]+2,yPosition);
      pdf.text("OBJECT",colX[1]+2,yPosition);
      pdf.text("CONFIDENCE",colX[2]+2,yPosition);
      pdf.text("COORDINATES",colX[3]+2,yPosition);
      pdf.text("DESCRIPTION",colX[4]+2,yPosition);

      yPosition += rowHeight;

      pdf.setTextColor(0,0,0);
      pdf.setFont("helvetica","normal");

      detections.forEach((d,index)=>{

        checkNewPage(10);

        if(index % 2 === 0){
          pdf.setFillColor(245,248,252);
          pdf.rect(margin,yPosition-5,pageWidth-margin*2,8,"F");
        }

        pdf.setFontSize(9);

        pdf.text(d.id,colX[0]+2,yPosition);

        pdf.text(
          d.class.replace("_"," ").toUpperCase(),
          colX[1]+2,
          yPosition
        );

        pdf.text(
          `${Math.round(d.confidence*100)}%`,
          colX[2]+2,
          yPosition
        );

        pdf.text(
          `[${d.bbox.join(",")}]`,
          colX[3]+2,
          yPosition
        );

        const desc = pdf.splitTextToSize(d.description,40);

        pdf.text(desc,colX[4]+2,yPosition);

        yPosition += rowHeight;
      });

      yPosition += 6;
    };



    /* ---------------- HEADER ---------------- */

    pdf.setFillColor(0,100,200);
    pdf.rect(0,0,pageWidth,35,"F");

    pdf.setTextColor(255,255,255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica","bold");

    pdf.text(
      "FORENSIC ANALYSIS REPORT",
      pageWidth/2,
      18,
      {align:"center"}
    );

    pdf.setFontSize(11);

    pdf.text(
      "Generated by ForensicAI Analyzer v2.1",
      pageWidth/2,
      26,
      {align:"center"}
    );



    /* ---------------- FORENSIC CASE SEAL ---------------- */

pdf.setLineWidth(1.2);
pdf.setDrawColor(255,0,0);  // white border so it appears on blue header

pdf.circle(pageWidth - 25, 20, 10);

pdf.setFontSize(7);
pdf.setFont("helvetica","bold");
pdf.setTextColor(255,0,0);

pdf.text(
  "CERTIFIED",
  pageWidth - 25,
  18,
  {align:"center"}
);

pdf.text(
  "FORENSIC LAB",
  pageWidth - 25,
  22,
  {align:"center"}
);
yPosition = 55;
pdf.setTextColor(0,0,0);
    /* ---------------- CASE INFO ---------------- */

    addBoxSection("CASE INFORMATION",[
      `1. Case Number: ${caseNumber}`,
      `2. Report Date: ${reportDate}`,
      `3. Crime Scene Location: ${crimeSceneLocation}`,
      `4. Lead Investigator: ${investigatorName}`,
      `5. Analysis Timestamp: ${analysisTime}`,
      `6. AI Model: YOLO v11 Forensic Detection System`
    ]);



    /* ---------------- TECH SPECS ---------------- */

    addBoxSection("TECHNICAL SPECIFICATIONS",[
      `1. File Size: ${result.metadata.fileSize}`,
      `2. Format: ${result.metadata.format}`
    ]);



    /* ---------------- IMAGE ---------------- */

    if(result.imageUrl){

      checkNewPage(100);

      pdf.setFont("helvetica","bold");
      pdf.setFontSize(12);

      pdf.text("CRIME SCENE IMAGE",margin,yPosition);

      yPosition += 6;

      pdf.addImage(
        result.imageUrl,
        "JPEG",
        margin,
        yPosition,
        pageWidth-margin*2,
        60
      );

      yPosition += 90;
    }



    /* ---------------- SUMMARY ---------------- */

    const totalItems = result.detections.length;

    const criticalCount =
      result.detections.filter(d =>
        d.confidence > 0.9 &&
        ["knife","gun","weapon"].includes(d.class.toLowerCase())
      ).length;

    const avgConfidence =
      totalItems === 0 ? 0 :
      Math.round(
        result.detections.reduce((acc,d)=>acc+d.confidence,0)
        / totalItems * 100
      );

    addBoxSection("EVIDENCE SUMMARY",[
      `1. Total Evidence Items: ${totalItems}`,
      `2. Critical Evidence Items: ${criticalCount}`,
      `3. Average Detection Confidence: ${avgConfidence}%`
    ]);



    /* ---------------- EVIDENCE TABLE ---------------- */

    addEvidenceTable(result.detections);



    /* ---------------- CHAIN OF CUSTODY ---------------- */

    addBoxSection("CHAIN OF CUSTODY DOCUMENTATION",[
      `1. Digital Evidence Created: ${analysisTime}`,
      `2. AI Analysis Completed: ${new Date().toLocaleString()}`,
      `3. Report Generated: ${new Date().toLocaleString()}`,
      `4. Processing System: ForensicAI Analyzer v2.1 (YOLO v11)`,
      `5. Lead Investigator: ${investigatorName}`,
      `6. Crime Scene Location: ${crimeSceneLocation}`,
      `7. Case Reference: ${caseNumber}`
    ]);



    /* ---------------- DISCLAIMER ---------------- */

    addBoxSection(
      "! IMPORTANT LEGAL DISCLAIMER !",
      [
        "1. This report was generated using AI-powered forensic analysis technology.",
        "2. All findings must be verified by qualified forensic experts.",
        "3. This report should not be used as the sole legal evidence."
      ]
    );

    /* ---------------- FOOTER ---------------- */

    pdf.setFontSize(8);

    pdf.text(
      `Report ID: ${caseNumber} | Generated: ${new Date().toISOString()} | ForensicAI v2.1`,
      pageWidth/2,
      pageHeight - 10,
      {align:"center"}
    );



    pdf.save(`Forensic_Analysis_Report_${caseNumber}.pdf`);

  }

  catch(err){

    console.error(err);
    alert("Error generating PDF");

  }

  finally{

    setIsGeneratingPDF(false);
    setShowInputs(false);

  }

};
  const criticalEvidence = result.detections.filter(d => 
    d.confidence > 0.9 && ['knife', 'gun', 'weapon'].includes(d.class.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-400/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-400/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Forensic Analysis Report</h2>
              <p className="text-sm text-slate-400">Case #{caseNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Input Modal */}
        {showInputs && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-slate-800 border border-blue-400/20 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-white mb-4">Report Information Required</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Crime Scene Location *
                  </label>
                  <input
                    type="text"
                    value={crimeSceneLocation}
                    onChange={(e) => setCrimeSceneLocation(e.target.value)}
                    placeholder="e.g., 123 Main Street, Downtown District"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Lead Investigator Name *
                  </label>
                  <input
                    type="text"
                    value={investigatorName}
                    onChange={(e) => setInvestigatorName(e.target.value)}
                    placeholder="e.g., Detective John Smith"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={downloadPDF}
                  disabled={!crimeSceneLocation.trim() || !investigatorName.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors text-white"
                >
                  Generate Report
                </button>
                <button
                  onClick={() => setShowInputs(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
          <div className="space-y-8">
            {/* Report Header */}
            <div className="bg-black/30 rounded-xl p-6 border border-blue-400/10">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Report Date:</span>
                    <span className="text-sm font-medium text-white">{reportDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Analyst:</span>
                    <span className="text-sm font-medium text-white">ForensicAI System v2.1</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">AI Model:</span>
                    <span className="text-sm font-medium text-white">YOLO v11 Forensic</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Analysis Time:</span>
                    <span className="text-sm font-medium text-white">{analysisTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Resolution:</span>
                    <span className="text-sm font-medium text-white">{result.metadata.resolution}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">File Size:</span>
                    <span className="text-sm font-medium text-white">{result.metadata.fileSize}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
              <div className="bg-black/30 rounded-xl p-6 border border-blue-400/10">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <div className="text-2xl font-bold text-blue-400">{result.detections.length}</div>
                    <div className="text-sm text-slate-300">Evidence Items</div>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-400/20">
                    <div className="text-2xl font-bold text-red-400">{criticalEvidence.length}</div>
                    <div className="text-sm text-slate-300">Critical Items</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-400/20">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round(result.detections.reduce((acc, d) => acc + d.confidence, 0) / result.detections.length * 100)}%
                    </div>
                    <div className="text-sm text-slate-300">Avg Confidence</div>
                  </div>
                </div>

                {criticalEvidence.length > 0 && (
                  <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-400 mb-1">Critical Evidence Alert</h4>
                      <p className="text-sm text-slate-300">
                        {criticalEvidence.length} high-priority evidence item(s) detected requiring immediate attention and secure chain of custody procedures.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Catalog */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Detailed Evidence Catalog</h3>
              <div className="space-y-4">
                {result.detections.map((detection, index) => (
                  <div key={detection.id} className="bg-black/30 rounded-xl p-6 border border-blue-400/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-white text-lg">
                          Evidence Item #{index + 1}
                        </h4>
                        <p className="text-blue-400 font-medium capitalize">
                          {detection.class.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          {Math.round(detection.confidence * 100)}%
                        </div>
                        <div className="text-sm text-slate-400">Confidence</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-slate-300 mb-2">Description</h5>
                        <p className="text-sm text-slate-400">{detection.description}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-300 mb-2">Location Coordinates</h5>
                        <p className="text-sm text-slate-400 font-mono">
                          [{detection.bbox.join(', ')}]
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-slate-300 mb-2">Forensic Significance</h5>
                      <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                        <p className="text-sm text-blue-300">{detection.forensicSignificance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="bg-black/30 rounded-xl p-6 border border-blue-400/10">
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">1.</span>
                    <span>Secure the crime scene and establish proper perimeter control</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">2.</span>
                    <span>Document all evidence with high-resolution photography before collection</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">3.</span>
                    <span>Collect physical evidence following proper chain of custody procedures</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">4.</span>
                    <span>Submit biological samples for laboratory DNA analysis</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">5.</span>
                    <span>Process fingerprint evidence through AFIS database comparison</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">6.</span>
                    <span>Conduct ballistics analysis for firearm-related evidence</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-400 mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-slate-300">
                    This report was generated using AI-powered forensic analysis. All findings should be verified by qualified forensic experts and laboratory analysis. This digital analysis serves as preliminary evidence identification and should not be used as sole evidence in legal proceedings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicReport;