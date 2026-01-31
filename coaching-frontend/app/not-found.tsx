'use client';

import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="z-10 flex flex-col items-center text-center px-4">
                {/* Animated 404 Text */}
                <h1 className="text-[150px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-2xl animate-bounce-slow">
                    404
                </h1>

                <div className="mt-8 mb-8 space-y-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-blue-200">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Page Not Found</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Lost in the digital void?
                    </h2>

                    <p className="text-lg text-slate-300 max-w-lg mx-auto leading-relaxed">
                        The page you are looking for might have been removed, had its name changed,
                        or is temporarily unavailable.
                    </p>
                </div>

                {/* Action Button */}
                <Link
                    href="/"
                    className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900"
                >
                    <Home className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-0.5" />
                    <span>Return Home</span>
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"></div>
                </Link>
            </div>

            {/* Footer text */}
            <div className="absolute bottom-8 text-slate-500 text-sm z-10">
                CoachingManagementSystem © {new Date().getFullYear()}
            </div>

            {/* CSS Animation for slow bounce if not in tailwind config */}
            <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-3%); }
          50% { transform: translateY(3%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
}
