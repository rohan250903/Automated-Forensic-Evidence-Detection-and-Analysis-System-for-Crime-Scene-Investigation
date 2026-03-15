import React from 'react';
import { Brain, Zap, Target, Search } from 'lucide-react';

const LoadingAnalysis: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/20 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
            <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin border-t-blue-400"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Analysis in Progress</h2>
          <p className="text-slate-300">YOLO v11 model processing forensic evidence...</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {[
            { 
              icon: Search, 
              title: 'Image Preprocessing', 
              description: 'Optimizing image quality and resolution',
              status: 'complete'
            },
            { 
              icon: Target, 
              title: 'Object Detection', 
              description: 'Scanning for weapons, biological evidence, and forensic materials',
              status: 'active'
            },
            { 
              icon: Zap, 
              title: 'Confidence Analysis', 
              description: 'Calculating detection accuracy and forensic significance',
              status: 'pending'
            },
            { 
              icon: Brain, 
              title: 'Report Generation', 
              description: 'Compiling comprehensive forensic analysis report',
              status: 'pending'
            }
          ].map(({ icon: Icon, title, description, status }, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-black/30 rounded-xl border border-blue-400/10">
              <div className={`p-2 rounded-lg ${
                status === 'complete' ? 'bg-green-500/20 text-green-400' :
                status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                <Icon className={`w-5 h-5 ${status === 'active' ? 'animate-pulse' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{title}</h3>
                <p className="text-sm text-slate-400">{description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {status === 'complete' && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
                {status === 'active' && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
                {status === 'pending' && (
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
            <div className="text-2xl font-bold text-blue-400">11</div>
            <div className="text-sm text-slate-300">YOLO Version</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
            <div className="text-2xl font-bold text-purple-400">80+</div>
            <div className="text-sm text-slate-300">Object Classes</div>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-400/20">
            <div className="text-2xl font-bold text-green-400">98%</div>
            <div className="text-sm text-slate-300">Accuracy Rate</div>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Processing...</span>
            <span>Estimated: 3s remaining</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnalysis;