"use client";

import Link from "next/link";

export default function Home() {
  // This is the home page - no redirects, no authentication checks
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-800/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">Coaching Sheba</span>
                <span className="text-xs text-purple-300">স্মার্ট কোচিং এর স্মার্ট সমাধান</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#home" className="text-purple-300 hover:text-white transition-colors font-medium">
                Home
              </Link>
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors font-medium">
                How It Works
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
                Pricing
              </Link>
              <Link href="#sms-pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
                SMS Pricing
              </Link>
              <Link href="#clients" className="text-gray-300 hover:text-white transition-colors font-medium">
                Clients
              </Link>
              <Link href="#tutorial" className="text-gray-300 hover:text-white transition-colors font-medium">
                Tutorial
              </Link>
              <Link href="#faq" className="text-gray-300 hover:text-white transition-colors font-medium">
                FAQ
              </Link>
            </div>
            <div className="flex items-center space-x-3 relative z-50">
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Register</span>
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-purple-800/50 text-white font-medium rounded-lg hover:bg-purple-800 transition-all flex items-center space-x-2 border border-purple-700 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block text-white">স্মার্ট কোচিং এর</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    স্মার্ট সমাধান
                  </span>
                  <span className="block text-white text-2xl md:text-3xl mt-2 font-normal">
                    কোচিং সেন্টার ম্যানেজ করুন এক ক্লিকেই।
              </span>
            </h1>
              </div>
              
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                CoachingSheba একটি আধুনিক Saas কোচিং ম্যানেজমেন্ট সফটওয়্যার, যা আপনার পুরো কোচিং ব্যবস্থাপনাকে স্বয়ংক্রিয় করে তোলে – শিক্ষার্থী ভর্তি, ফি সংগ্রহ, উপস্থিতি ট্র্যাকিং, ফলাফল ব্যবস্থাপনা এবং হোমওয়ার্ক ও যোগাযোগ – সবকিছু এখন এক প্ল্যাটফর্মেই সহজে করা সম্ভব।
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 relative z-50">
              <Link
                href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Register</span>
              </Link>
              <Link
                  href="/login"
                  className="px-8 py-4 bg-purple-800/50 text-white font-semibold rounded-lg hover:bg-purple-800 transition-all border border-purple-700 flex items-center justify-center space-x-2 cursor-pointer"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Login</span>
              </Link>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-800/30 to-pink-800/30 rounded-3xl p-8 backdrop-blur-sm border border-purple-700/30">
                {/* Result Management Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-white font-semibold">Result Management</span>
                  </div>
                </div>
                
                {/* People Illustration */}
                <div className="flex items-end justify-center space-x-4 mb-6">
                  {/* Person 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="w-12 h-2 bg-purple-500 rounded"></div>
                  </div>
                  
                  {/* Person 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-2 relative">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {/* Envelope icon */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-purple-500 rounded"></div>
                  </div>
                  
                  {/* Person 3 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="w-12 h-2 bg-purple-500 rounded"></div>
                  </div>
                </div>
                
                {/* Floating Icons */}
                <div className="relative">
                  <div className="absolute -top-4 left-4 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="absolute -top-4 right-8 w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-yellow-400/30">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-4 left-8 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-green-400/30">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.92 3.016a1.616 1.616 0 01.447 1.984c-.726.268-1.578.482-2.367.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm-3.92 3.016a1.616 1.616 0 00-.447 1.984c.726.268 1.578.482 2.367.556H7.153c.093-1.414.377-2.649.766-3.556.24-.56.5-.948.737-1.182C8.768 4.032 8.924 4 9 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-4 right-4 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-purple-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              আমাদের বৈশিষ্ট্যসমূহ
            </h2>
            <p className="text-xl text-purple-300 max-w-2xl mx-auto">
              একটি সফটওয়্যারে কোচিং ম্যানেজমেন্টের সব কিছু সহজভাবে পরিচালনা করুন
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-purple-800/20 to-pink-800/20 rounded-2xl hover:shadow-xl transition-all border border-purple-700/30 backdrop-blur-sm">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">শিক্ষার্থী ব্যবস্থাপনা</h3>
              <p className="text-gray-300 leading-relaxed">
                সহজেই শিক্ষার্থী ভর্তি, উপস্থিতি ট্র্যাকিং, একাডেমিক অগ্রগতি মনিটরিং এবং বিস্তারিত রেকর্ড রাখুন।
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-blue-800/20 to-cyan-800/20 rounded-2xl hover:shadow-xl transition-all border border-blue-700/30 backdrop-blur-sm">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">কোর্স ও ব্যাচ ব্যবস্থাপনা</h3>
              <p className="text-gray-300 leading-relaxed">
                কোর্স সংগঠিত করুন, একাধিক ব্যাচ তৈরি করুন, ক্লাস শিডিউল করুন এবং শিক্ষক নিয়োগ করুন।
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-green-800/20 to-emerald-800/20 rounded-2xl hover:shadow-xl transition-all border border-green-700/30 backdrop-blur-sm">
              <div className="h-14 w-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">পরীক্ষা ও ফলাফল</h3>
              <p className="text-gray-300 leading-relaxed">
                পরীক্ষা তৈরি করুন, ফলাফল আপলোড করুন, স্বয়ংক্রিয়ভাবে গ্রেড গণনা করুন এবং রিপোর্ট তৈরি করুন।
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gradient-to-br from-orange-800/20 to-amber-800/20 rounded-2xl hover:shadow-xl transition-all border border-orange-700/30 backdrop-blur-sm">
              <div className="h-14 w-14 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">উপস্থিতি ট্র্যাকিং</h3>
              <p className="text-gray-300 leading-relaxed">
                দৈনিক উপস্থিতি মার্ক করুন, উপস্থিতি রিপোর্ট দেখুন, শতাংশ গণনা করুন এবং অভিভাবকদের নোটিফিকেশন পাঠান।
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gradient-to-br from-cyan-800/20 to-blue-800/20 rounded-2xl hover:shadow-xl transition-all border border-cyan-700/30 backdrop-blur-sm">
              <div className="h-14 w-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">ফি সংগ্রহ ব্যবস্থাপনা</h3>
              <p className="text-gray-300 leading-relaxed">
                ফি পেমেন্ট ট্র্যাক করুন, রসিদ তৈরি করুন, পেমেন্ট হিস্ট্রি ম্যানেজ করুন এবং রিমাইন্ডার পাঠান।
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gradient-to-br from-indigo-800/20 to-purple-800/20 rounded-2xl hover:shadow-xl transition-all border border-indigo-700/30 backdrop-blur-sm">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">এনালিটিক্স ও রিপোর্ট</h3>
              <p className="text-gray-300 leading-relaxed">
                বিস্তারিত ড্যাশবোর্ড, রিপোর্ট তৈরি করুন এবং মূল পারফরমেন্স মেট্রিক্স ট্র্যাক করুন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-purple-800/30 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Coaching Sheba. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
