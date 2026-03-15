import React, { useRef, useEffect, useState } from 'react';
import { Camera, Square, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Simple video constraints for better compatibility
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Set up event listeners
        const video = videoRef.current;
        
        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded');
          video.play().then(() => {
            console.log('Video playing');
            setStream(mediaStream);
            setIsActive(true);
            setIsLoading(false);
          }).catch((playError) => {
            console.error('Error playing video:', playError);
            setError('Failed to start video playback');
            setIsLoading(false);
          });
        };

        const handleError = (err: Event) => {
          console.error('Video error:', err);
          setError('Video playback error');
          setIsLoading(false);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);
        
        // Cleanup function
        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
        };
      }
      
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No camera device found.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Camera is not supported in this browser.';
        } else if (err.name === 'NotReadableError') {
          errorMessage += 'Camera is already in use by another application.';
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Ensure video is playing and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Video not ready. Please wait and try again.');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            onCapture(imageUrl);
            stopCamera();
          } else {
            setError('Failed to capture image. Please try again.');
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {!isActive && !error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startCamera}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Start Camera</span>
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <div className="text-blue-400">Starting camera...</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-red-400 mb-4 text-sm">{error}</div>
              <button
                onClick={startCamera}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ display: isActive ? 'block' : 'none' }}
        />
        
        <canvas ref={canvasRef} className="hidden" />
        
        {isActive && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={capturePhoto}
              className="bg-red-500 hover:bg-red-600 p-4 rounded-full transition-colors shadow-lg"
              title="Capture Evidence"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
            <button
              onClick={stopCamera}
              className="bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Stop Camera
            </button>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-slate-400">
        {isActive ? (
          <>
            <p>Position camera to capture crime scene evidence</p>
            <p>Ensure good lighting for optimal AI detection accuracy</p>
          </>
        ) : (
          <>
            <p>Click "Start Camera" to begin live evidence capture</p>
            <p>Make sure to allow camera permissions when prompted</p>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;