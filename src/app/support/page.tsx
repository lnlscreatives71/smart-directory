'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

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

            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">Message sent!</h3>
                <p className="text-slate-400">We&apos;ll get back to you at {form.email} within 1 business day.</p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-300">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 rounded-xl glass-input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full p-3 rounded-xl glass-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-300">Subject</label>
                  <select
                    className="w-full p-3 rounded-xl glass-input appearance-none"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  >
                    <option value="general" className="bg-slate-800">General Inquiry</option>
                    <option value="billing" className="bg-slate-800">Billing / Premium Subscription</option>
                    <option value="claim" className="bg-slate-800">Claim a Business Listing</option>
                    <option value="technical" className="bg-slate-800">Technical Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-300">Message</label>
                  <textarea
                    rows={5}
                    required
                    className="w-full p-3 rounded-xl glass-input"
                    placeholder="How can we help you today?"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  ></textarea>
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-primary w-full py-4 rounded-xl text-lg shadow-lg shadow-primary-500/25 disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Sending…' : 'Submit Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            <div className="glass rounded-3xl p-8 shadow-xl border border-white/10">
              <h2 className="text-xl font-bold mb-6 text-white">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-slate-800 p-3 rounded-xl mr-4 text-primary-400">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:directory@thetrianglehub.online" className="text-slate-400 hover:text-primary-400 transition-colors">directory@thetrianglehub.online</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-slate-800 p-3 rounded-xl mr-4 text-primary-400">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <a href="tel:+13507772961" className="text-slate-400 hover:text-primary-400 transition-colors">(350) 777-2961</a>
                    <p className="text-xs text-slate-500 mt-1">Mon-Fri, 9am - 5pm EST</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-slate-800 p-3 rounded-xl mr-4 text-primary-400">
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
                  <p className="text-sm text-slate-400">Navigate to your business profile, click &quot;Are you the owner? Claim this listing&quot;, and follow the verification steps.</p>
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
