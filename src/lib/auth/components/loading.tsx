import { useEffect, useState, type ReactNode } from 'react';
import cvlogo from '../../../assets/cvlogo.png'; 


interface PageLoaderProps {
  children?: ReactNode;
}

export default function PageLoader({ children }: PageLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 12;
      });
    }, 200);

    const timeout = setTimeout(() => {
      setProgress(90);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <img
            src={cvlogo}
            alt="Loading"
            style={{
              width: '200px',

              opacity: 0.8,
            }}
          />
        </div>

       
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-mild-accent3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {children && (
          <div className="mt-1 text-center">
            {children}
          </div>
        )}

      </div>
    </div>
  );
}