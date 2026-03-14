import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-20 text-white bg-[#0B0F19]">
      {/* Header */}
      <section className="bg-slate-900 border-b border-white/10 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-secondary-500/5 blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2" size={16} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass rounded-3xl p-8 md:p-12 shadow-xl border border-white/10 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. Information We Collect</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We collect information that you manually provide to us, as well as information automatically generated as you use our Services:
            </p>
            <ul className="list-disc pl-5 text-slate-300 space-y-2 marker:text-secondary-500">
              <li><strong>Personal Data:</strong> Name, email address, phone number when you register or contact a business.</li>
              <li><strong>Business Data:</strong> Information you provide about your business if you claim or create a listing.</li>
              <li><strong>Usage Data:</strong> IP addresses, browser type, pages visited, and interaction data via cookies and analytics tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. How We Use Your Information</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-5 text-slate-300 space-y-2 marker:text-secondary-500">
              <li>To provide, maintain, and improve our Services.</li>
              <li>To connect consumers with local businesses (e.g., forwarding inquiries).</li>
              <li>To process transactions for premium business listings via Stripe.</li>
              <li>To communicate with you regarding updates, support, or marketing (which you can opt out of).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. Information Sharing and Disclosure</h2>
            <p className="text-slate-300 leading-relaxed">
              We do not sell your personal data. We may share information with:
              <br /><br />
              <strong>Local Businesses:</strong> When you use a lead generation form or booking widget.
              <br />
              <strong>Service Providers:</strong> Third-party vendors who assist us in operating our platform (e.g., Vercel, Stripe, PostgreSQL hosting).
              <br />
              <strong>Legal Requirements:</strong> If required by law or to protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Data Security</h2>
            <p className="text-slate-300 leading-relaxed">
              We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed">
              Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete your information. Contact us to exercise these rights.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10">
            <p className="text-slate-400">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@trianglelocalhub.com" className="text-primary-400 hover:text-primary-300 transition-colors">privacy@trianglelocalhub.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
