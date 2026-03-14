import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen pb-20 text-white bg-[#0B0F19]">
      {/* Header */}
      <section className="bg-slate-900 border-b border-white/10 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-primary-500/5 blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2" size={16} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-slate-400 text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass rounded-3xl p-8 md:p-12 shadow-xl border border-white/10 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              Welcome to Triangle Local Hub ("we", "our", or "us"). By accessing or using our website, services, or tools (collectively, the "Services"), you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Use of Services</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Our Services are designed to connect local consumers with businesses in the Triangle area (Raleigh, Durham, Cary, and surrounding areas).
            </p>
            <ul className="list-disc pl-5 text-slate-300 space-y-2 marker:text-primary-500">
              <li>You must be at least 18 years old to create a business listing.</li>
              <li>You agree to provide accurate, current, and complete information.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You may not use our Services for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. Business Listings</h2>
            <p className="text-slate-300 leading-relaxed">
              By submitting a business listing, you represent that you have the authority to represent the business. We reserve the right to review, edit, reject, or remove any listing at our sole discretion. Paid premium features are subject to our pricing terms and may be updated from time to time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. User Content</h2>
            <p className="text-slate-300 leading-relaxed">
              Users may post reviews, comments, or other content. You retain ownership of your content, but you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display it in connection with our Services. Content that is defamatory, abusive, or violates third-party rights is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              Triangle Local Hub provides the Services "as is". We make no warranties regarding the accuracy of business information or the quality of services provided by listed businesses. We shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to modify these terms at any time. We will indicate the date of the last update at the top of this page. Your continued use of the Services following any changes constitutes acceptance of those changes.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10">
            <p className="text-slate-400">
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@trianglelocalhub.com" className="text-primary-400 hover:text-primary-300 transition-colors">legal@trianglelocalhub.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
