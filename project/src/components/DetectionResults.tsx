import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Target, Droplet, Fingerprint, Zap, Info } from 'lucide-react';

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

interface DetectionResultsProps {
  result: AnalysisResult;
}

const getEvidenceIcon = (className: string) => {
  switch (className.toLowerCase()) {
    case 'knife':
    case 'gun':
    case 'weapon':
      return AlertTriangle;
    case 'blood_stain':
    case 'blood':
      return Droplet;
    case 'fingerprint':
      return Fingerprint;
    case 'shell_casing':
      return Target;
    default:
      return Info;
  }
};

const getEvidenceColor = (className: string) => {
  switch (className.toLowerCase()) {
    case 'knife':
    case 'gun':
    case 'weapon':
      return 'red';
    case 'blood_stain':
    case 'blood':
      return 'red';
    case 'fingerprint':
      return 'blue';
    case 'shell_casing':
      return 'yellow';
    default:
      return 'gray';
  }
};

const colorClass = (color: string) => {
  const map: Record<string, { border: string; bg: string; text: string }> = {
    red: { border: 'border-red-400', bg: 'bg-red-500/20', text: 'text-red-400' },
    blue: { border: 'border-blue-400', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    yellow: { border: 'border-yellow-400', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    green: { border: 'border-green-400', bg: 'bg-green-500/20', text: 'text-green-400' },
    gray: { border: 'border-gray-400', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  };
  return map[color] ?? map.gray;
};

const priorityClass = (color: string) => {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-400/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-400/30' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-400/30' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-400/30' },
    gray: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-400/30' },
  };
  return map[color] ?? map.gray;
};

const getPriorityLevel = (confidence: number, className: string) => {
  if (confidence > 0.9 && ['knife', 'gun', 'weapon'].includes(className.toLowerCase())) {
    return { level: 'CRITICAL', color: 'red' };
  } else if (confidence > 0.8) {
    return { level: 'HIGH', color: 'orange' };
  } else if (confidence > 0.7) {
    return { level: 'MEDIUM', color: 'yellow' };
  } else {
    return { level: 'LOW', color: 'green' };
  }
};

const DetectionResults: React.FC<DetectionResultsProps> = ({ result }) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  });

  useEffect(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const updateSize = () => {
      setImageSize({
        width: img.offsetWidth,
        height: img.offsetHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    };

    if (img.complete) {
      updateSize();
    }

    img.addEventListener('load', updateSize);
    window.addEventListener('resize', updateSize);

    return () => {
      img.removeEventListener('load', updateSize);
      window.removeEventListener('resize', updateSize);
    };
  }, [result.imageUrl]);

  const getScaledBBox = ([x1, y1, x2, y2]: [number, number, number, number]) => {
    if (!imageSize.naturalWidth || !imageSize.naturalHeight) {
      return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
    }

    const scaleX = imageSize.width / imageSize.naturalWidth;
    const scaleY = imageSize.height / imageSize.naturalHeight;

    return {
      x: x1 * scaleX,
      y: y1 * scaleY,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY,
    };
  };

  return (
    <div className="space-y-8">
      {/* Analysis Overview */}
      <div className="bg-black/20 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span>Detection Analysis</span>
          </h3>
          <div className="text-right text-sm text-slate-400">
            <p>Analyzed: {new Date(result.timestamp).toLocaleString()}</p>
            <p>Resolution: {result.metadata.resolution} | Size: {result.metadata.fileSize}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{result.detections.length}</div>
            <div className="text-sm text-slate-300">Items Detected</div>
          </div>
          <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {result.detections.filter(d => getPriorityLevel(d.confidence, d.class).level === 'CRITICAL').length}
            </div>
            <div className="text-sm text-slate-300">Critical Evidence</div>
          </div>
          <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(result.detections.reduce((acc, d) => acc + d.confidence, 0) / result.detections.length * 100)}%
            </div>
            <div className="text-sm text-slate-300">Avg Confidence</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {new Set(result.detections.map(d => d.class)).size}
            </div>
            <div className="text-sm text-slate-300">Evidence Types</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image with Detections */}
        <div className="bg-black/20 backdrop-blur-xl border border-blue-400/20 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-blue-400/20">
            <h4 className="font-semibold text-white">Evidence Visualization</h4>
          </div>
          <div className="relative">
            <img
              ref={imgRef}
              src={result.imageUrl}
              alt="Crime scene analysis"
              className="w-full h-auto"
            />
            {/* Detection Bounding Boxes */}
            {result.detections.map((detection) => {
              const { x, y, width, height } = getScaledBBox(detection.bbox);
              const color = getEvidenceColor(detection.class);
              const classes = colorClass(color);

              return (
                <div
                  key={detection.id}
                  className={`absolute border-2 ${classes.border}`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                >
                  <div className={`absolute -top-8 left-0 ${classes.bg} text-white px-2 py-1 rounded text-xs font-medium`}>
                    {detection.class} ({Math.round(detection.confidence * 100)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detection Details */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Evidence Catalog</h4>
          {result.detections.map((detection) => {
            const Icon = getEvidenceIcon(detection.class);
            const priority = getPriorityLevel(detection.confidence, detection.class);
            
            return (
              <div key={detection.id} className="bg-black/20 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  {(() => {
                    const color = getEvidenceColor(detection.class);
                    const classes = colorClass(color);
                    return (
                      <div className={`p-2 ${classes.bg} rounded-lg`}>
                        <Icon className={`w-5 h-5 ${classes.text}`} />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-white capitalize">
                        {detection.class.replace('_', ' ')}
                      </h5>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const p = priorityClass(priority.color);
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.bg} ${p.text} border ${p.border}`}>
                              {priority.level}
                            </span>
                          );
                        })()}
                        <span className="text-sm text-slate-400">
                          {Math.round(detection.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{detection.description}</p>
                    <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-400/20 rounded-lg p-2">
                      <strong>Forensic Significance:</strong> {detection.forensicSignificance}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetectionResults;












// import React, { useEffect, useRef, useState } from "react";
// import {
//   AlertTriangle,
//   Target,
//   Droplet,
//   Fingerprint,
//   Zap,
//   Info,
// } from "lucide-react";

// /* ================= TYPES ================= */

// interface Detection {
//   id: string;
//   class: string;
//   confidence: number;
//   bbox: [number, number, number, number]; // [x1, y1, x2, y2]
//   description: string;
//   forensicSignificance: string;
// }

// interface AnalysisResult {
//   detections: Detection[];
//   imageUrl: string;
//   timestamp: string;
//   metadata: {
//     resolution: string; // e.g. "1920x1080"
//     fileSize: string;
//     format: string;
//   };
// }

// interface DetectionResultsProps {
//   result: AnalysisResult;
// }

// /* ================= HELPERS ================= */

// const getEvidenceIcon = (className: string) => {
//   switch (className.toLowerCase()) {
//     case "knife":
//     case "gun":
//     case "weapon":
//       return AlertTriangle;
//     case "blood":
//     case "blood_stain":
//       return Droplet;
//     case "fingerprint":
//       return Fingerprint;
//     case "shell_casing":
//       return Target;
//     default:
//       return Info;
//   }
// };

// const getEvidenceColor = (className: string) => {
//   switch (className.toLowerCase()) {
//     case "knife":
//     case "gun":
//     case "weapon":
//     case "blood":
//     case "blood_stain":
//       return "red";
//     case "fingerprint":
//       return "blue";
//     case "shell_casing":
//       return "yellow";
//     default:
//       return "gray";
//   }
// };

// const getPriorityLevel = (confidence: number, className: string) => {
//   if (confidence > 0.9 && ["knife", "gun", "weapon"].includes(className.toLowerCase())) {
//     return { level: "CRITICAL", color: "red" };
//   } else if (confidence > 0.8) {
//     return { level: "HIGH", color: "orange" };
//   } else if (confidence > 0.7) {
//     return { level: "MEDIUM", color: "yellow" };
//   } else {
//     return { level: "LOW", color: "green" };
//   }
// };

// /* ================= COMPONENT ================= */

// const DetectionResults: React.FC<DetectionResultsProps> = ({ result }) => {
//   const imgRef = useRef<HTMLImageElement>(null);

//   const [scale, setScale] = useState({ x: 1, y: 1 });

//   /* ================= SCALE CALCULATION ================= */
//   useEffect(() => {
//     if (!imgRef.current) return;

//     const [origW, origH] = result.metadata.resolution
//       .split("x")
//       .map(Number);

//     const displayedW = imgRef.current.clientWidth;
//     const displayedH = imgRef.current.clientHeight;

//     setScale({
//       x: displayedW / origW,
//       y: displayedH / origH,
//     });
//   }, [result]);

//   return (
//     <div className="space-y-8">

//       {/* ================= OVERVIEW ================= */}
//       <div className="bg-black/20 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6">
//         <div className="flex justify-between mb-6">
//           <h3 className="text-xl font-bold flex items-center space-x-2">
//             <Zap className="w-5 h-5 text-blue-400" />
//             <span>Detection Analysis</span>
//           </h3>
//           <div className="text-sm text-slate-400 text-right">
//             <p>{new Date(result.timestamp).toLocaleString()}</p>
//             <p>Resolution: {result.metadata.resolution}</p>
//           </div>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-8">

//         {/* ================= IMAGE + BOUNDING BOXES ================= */}
//         <div className="bg-black/20 backdrop-blur-xl border border-blue-400/20 rounded-2xl overflow-hidden">
//           <div className="p-4 border-b border-blue-400/20">
//             <h4 className="font-semibold text-white">Evidence Visualization</h4>
//           </div>

//           {/* 🔑 THIS WRAPPER IS THE KEY FIX */}
//           <div className="relative inline-block w-full">
//             <img
//               ref={imgRef}
//               src={result.imageUrl}
//               alt="Crime Scene"
//               className="block w-full h-auto"
//               onLoad={() => {
//                 if (!imgRef.current) return;
//                 const [ow, oh] = result.metadata.resolution.split("x").map(Number);
//                 setScale({
//                   x: imgRef.current.clientWidth / ow,
//                   y: imgRef.current.clientHeight / oh,
//                 });
//               }}
//             />

//             {result.detections.map((det) => {
//               const [x1, y1, x2, y2] = det.bbox;
//               const color = getEvidenceColor(det.class);

//               return (
//                 <div
//                   key={det.id}
//                   className={`absolute border-2 border-${color}-400`}
//                   style={{
//                     left: x1 * scale.x,
//                     top: y1 * scale.y,
//                     width: (x2 - x1) * scale.x,
//                     height: (y2 - y1) * scale.y,
//                   }}
//                 >
//                   <div
//                     className={`absolute -top-7 left-0 bg-${color}-500 text-white px-2 py-1 rounded text-xs`}
//                   >
//                     {det.class} ({Math.round(det.confidence * 100)}%)
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* ================= DETAILS ================= */}
//         <div className="space-y-4">
//           <h4 className="text-lg font-semibold text-white">Evidence Catalog</h4>

//           {result.detections.map((det) => {
//             const Icon = getEvidenceIcon(det.class);
//             const priority = getPriorityLevel(det.confidence, det.class);
//             const color = getEvidenceColor(det.class);

//             return (
//               <div
//                 key={det.id}
//                 className="bg-black/20 border border-blue-400/20 rounded-xl p-4"
//               >
//                 <div className="flex space-x-3">
//                   <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
//                     <Icon className={`w-5 h-5 text-${color}-400`} />
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex justify-between mb-2">
//                       <h5 className="font-semibold text-white capitalize">
//                         {det.class.replace("_", " ")}
//                       </h5>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs bg-${priority.color}-500/20 text-${priority.color}-400`}
//                       >
//                         {priority.level}
//                       </span>
//                     </div>
//                     <p className="text-sm text-slate-300 mb-2">
//                       {det.description}
//                     </p>
//                     <p className="text-xs text-blue-300 bg-blue-500/10 p-2 rounded">
//                       <strong>Forensic Significance:</strong>{" "}
//                       {det.forensicSignificance}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default DetectionResults;














// import React from 'react';
// import {
//   AlertTriangle,
//   Target,
//   Droplet,
//   // Fingerprint,
//   Info,
//   Zap
// } from 'lucide-react';

// /* ================= TYPES ================= */

// interface Detection {
//   id: string;
//   class: string;
//   confidence: number;
//   // YOLO FORMAT: [x1, y1, x2, y2] IN IMAGE PIXELS
//   bbox: [number, number, number, number];
//   description?: string;
//   forensicSignificance?: string;
// }

// interface AnalysisResult {
//   detections: Detection[];
//   imageUrl: string;
//   timestamp: string;
//   metadata: {
//     resolution: string;
//     fileSize: string;
//     format: string;
//   };
// }

// interface DetectionResultsProps {
//   result: AnalysisResult;
// }

// /* ================= CLASS GROUPS ================= */

// const WEAPON_CLASSES = ['knife', 'gun', 'rod', 'hammer', 'bullets'];
// const BIO_CLASSES = ['human', 'body', 'blood'];
// const TRACE_CLASSES = ['glass shards'];

// /* ================= HELPERS ================= */

// const formatLabel = (cls: string) =>
//   cls.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

// const getEvidenceIcon = (cls: string) => {
//   if (WEAPON_CLASSES.includes(cls)) return AlertTriangle;
//   if (BIO_CLASSES.includes(cls)) return Droplet;
//   if (TRACE_CLASSES.includes(cls)) return Target;
//   return Info;
// };

// const getEvidenceColor = (cls: string) => {
//   if (WEAPON_CLASSES.includes(cls)) return 'red';
//   if (cls === 'blood') return 'red';
//   if (cls === 'human' || cls === 'body') return 'orange';
//   if (cls === 'glass shards') return 'yellow';
//   return 'gray';
// };

// const getPriorityLevel = (confidence: number, cls: string) => {
//   if (
//     confidence > 0.85 &&
//     (WEAPON_CLASSES.includes(cls) || cls === 'blood' || cls === 'human')
//   ) {
//     return { level: 'CRITICAL', color: 'red' };
//   }
//   if (confidence > 0.7) return { level: 'HIGH', color: 'orange' };
//   if (confidence > 0.5) return { level: 'MEDIUM', color: 'yellow' };
//   return { level: 'LOW', color: 'green' };
// };

// /* ================= COMPONENT ================= */

// const DetectionResults: React.FC<DetectionResultsProps> = ({ result }) => {
//   return (
//     <div className="space-y-8">

//       {/* ===== HEADER ===== */}
//       <div className="bg-black/30 border border-blue-400/20 rounded-xl p-6">
//         <div className="flex justify-between items-center">
//           <h3 className="text-xl font-bold flex items-center gap-2">
//             <Zap className="text-blue-400" />
//             Detection Analysis
//           </h3>
//           <div className="text-sm text-slate-400">
//             {new Date(result.timestamp).toLocaleString()}
//           </div>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-8">

//         {/* ===== IMAGE + BOXES ===== */}
//         <div className="relative bg-black/30 border border-blue-400/20 rounded-xl overflow-hidden">
//           <img
//             src={result.imageUrl}
//             alt="Detection"
//             className="w-full h-auto block"
//           />

//           {result.detections.map((det) => {
//             const [x1, y1, x2, y2] = det.bbox;
//             const color = getEvidenceColor(det.class);

//             return (
//               <div
//                 key={det.id}
//                 className={`absolute border-2 border-${color}-400`}
//                 style={{
//                   left: `${x1}px`,
//                   top: `${y1}px`,
//                   width: `${x2 - x1}px`,
//                   height: `${y2 - y1}px`
//                 }}
//               >
//                 <div
//                   className={`absolute -top-6 left-0 bg-${color}-500 text-white text-xs px-2 py-1 rounded`}
//                 >
//                   {formatLabel(det.class)} ({Math.round(det.confidence * 100)}%)
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* ===== DETECTION LIST ===== */}
//         <div className="space-y-4">
//           <h4 className="text-lg font-semibold">Evidence Catalog</h4>

//           {result.detections.map((det) => {
//             const Icon = getEvidenceIcon(det.class);
//             const priority = getPriorityLevel(det.confidence, det.class);
//             const color = getEvidenceColor(det.class);

//             return (
//               <div
//                 key={det.id}
//                 className="bg-black/30 border border-blue-400/20 rounded-lg p-4"
//               >
//                 <div className="flex gap-3">
//                   <div className={`p-2 bg-${color}-500/20 rounded`}>
//                     <Icon className={`text-${color}-400`} />
//                   </div>

//                   <div className="flex-1">
//                     <div className="flex justify-between items-center">
//                       <h5 className="font-semibold">
//                         {formatLabel(det.class)}
//                       </h5>
//                       <span
//                         className={`text-xs px-2 py-1 rounded bg-${priority.color}-500/20 text-${priority.color}-400`}
//                       >
//                         {priority.level}
//                       </span>
//                     </div>

//                     <p className="text-sm text-slate-300 mt-1">
//                       Confidence: {Math.round(det.confidence * 100)}%
//                     </p>

//                     <p className="text-xs text-blue-300 mt-2 bg-blue-500/10 p-2 rounded">
//                       Forensic Significance: Potential forensic evidence detected by AI-based analysis
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default DetectionResults;
