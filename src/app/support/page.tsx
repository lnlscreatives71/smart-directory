import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MessageSquare, MapPin } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen pb-20 text-white bg-[#0B0F19]">
      {/* Header */}
      <section className="bg-slate-900 border-b border-white/10 py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-violet-500/10 blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How can we help?</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Whether you are a local business owner looking to optimize your listing, or a consumer needing help, our team is here for you.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <div className="glass rounded-3xl p-8 shadow-xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-white">Send us a message</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-300">Name</label>
                  <input type="text" className="w-full p-3 rounded-xl glass-input" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-300">Email Address</label>
                  <input type="email" className="w-full p-3 rounded-xl glass-input" placeholder="you@example.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Subject</label>
                <select className="w-full p-3 rounded-xl glass-input appearance-none">
                  <option value="general" className="bg-slate-800">General Inquiry</option>
                  <option value="billing" className="bg-slate-800">Billing / Premium Subscription</option>
                  <option value="claim" className="bg-slate-800">Claim a Business Listing</option>
                  <option value="technical" className="bg-slate-800">Technical Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Message</label>
                <textarea rows={5} className="w-full p-3 rounded-xl glass-input" placeholder="How can we help you today?"></textarea>
              </div>

              <button type="button" className="btn-primary w-full py-4 rounded-xl text-lg shadow-lg shadow-blue-500/25">
                Submit Message
              </button>
            </form>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            <div className="glass rounded-3xl p-8 shadow-xl border border-white/10">
              <h2 className="text-xl font-bold mb-6 text-white">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-slate-800 p-3 rounded-xl mr-4 text-blue-400">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:support@trianglelocalhub.com" className="text-slate-400 hover:text-blue-400 transition-colors">support@trianglelocalhub.com</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-slate-800 p-3 rounded-xl mr-4 text-blue-400">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <a href="tel:9195550100" className="text-slate-400 hover:text-blue-400 transition-colors">(919) 555-0100</a>
                    <p className="text-xs text-slate-500 mt-1">Mon-Fri, 9am - 5pm EST</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-slate-800 p-3 rounded-xl mr-4 text-blue-400">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Headquarters</p>
                    <p className="text-slate-400">Raleigh, North Carolina 27601</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 shadow-xl border border-white/10">
              <h2 className="text-xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="font-semibold text-white mb-2 text-sm">How do I claim my business?</h3>
                  <p className="text-sm text-slate-400">Navigate to your business profile, click "Are you the owner? Claim this listing", and follow the verification steps.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-sm">How long does an upgrade take?</h3>
                  <p className="text-sm text-slate-400">Premium upgrades are processed instantly upon successful payment via Stripe.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
