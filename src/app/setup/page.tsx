'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2, AlertCircle, Database, Settings, User } from 'lucide-react';

type Step = 'check' | 'migrate' | 'configure' | 'done' | 'already_done';

interface MigrationResult {
    file: string;
    status: 'applied' | 'skipped' | 'error';
    error?: string;
}

export default function SetupPage() {
    const [step, setStep] = useState<Step>('check');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([]);
    const [form, setForm] = useState({
        admin_name: '',
        admin_email: '',
        admin_password: '',
        site_name: '',
        location_region: '',
        contact_email: '',
        contact_phone: '',
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
    });

    useEffect(() => {
        // Check if setup is needed
        fetch('/api/setup')
            .then(r => r.json())
            .then(data => {
                if (!data.setup_needed) {
                    setStep('already_done');
                } else {
                    setStep('migrate');
                }
            })
            .catch(() => setStep('migrate'));
    }, []);

    const runMigrations = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/migrate');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setMigrationResults(data.results || []);
            setStep('configure');
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStep('done');
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    if (step === 'check') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (step === 'already_done') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Already Set Up</h1>
                    <p className="text-slate-400 mb-6">Your directory is already configured. Log in to your dashboard to manage it.</p>
                    <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    if (step === 'done') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Setup Complete!</h1>
                    <p className="text-slate-400 mb-8">Your directory is ready. Log in to your admin dashboard to import listings and configure your menu.</p>
                    <div className="space-y-3">
                        <a href="/login" className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition text-center">
                            Log In to Dashboard
                        </a>
                        <a href="/" className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-xl transition text-center">
                            View Directory
                        </a>
                    </div>
                    <div className="mt-6 p-4 bg-slate-800 rounded-xl text-left text-sm text-slate-400">
                        <p className="font-semibold text-slate-300 mb-2">Next steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Import your business listings (Dashboard → Import)</li>
                            <li>Set up your navigation menu (Dashboard → Menu Builder)</li>
                            <li>Configure your plans &amp; pricing (Dashboard → Plans)</li>
                            <li>Add your logo and branding (Dashboard → Settings)</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <Settings className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Directory Setup</h1>
                    <p className="text-slate-400 mt-2">Let's get your white-label directory up and running.</p>
                </div>

                {/* Step: Migrate */}
                {step === 'migrate' && (
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Step 1: Initialize Database</h2>
                        </div>
                        <p className="text-slate-400 mb-6">
                            This will create all required tables in your Neon database. Safe to run — uses <code className="text-blue-400 bg-slate-800 px-1 rounded">CREATE TABLE IF NOT EXISTS</code>.
                        </p>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4 text-red-300">
                                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={runMigrations}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                            {loading ? 'Initializing database...' : 'Initialize Database'}
                        </button>
                    </div>
                )}

                {/* Step: Configure */}
                {step === 'configure' && (
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
                        {/* Migration results */}
                        {migrationResults.length > 0 && (
                            <div className="mb-6 p-4 bg-slate-800 rounded-xl">
                                <p className="text-sm font-semibold text-green-400 mb-2">
                                    ✅ Database initialized — {migrationResults.filter(r => r.status === 'applied').length} migration(s) applied
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Step 2: Configure Your Directory</h2>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4 text-red-300">
                                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Admin account */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Admin Account</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={form.admin_name}
                                        onChange={e => setForm(f => ({ ...f, admin_name: e.target.value }))}
                                        className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Admin email *"
                                        required
                                        value={form.admin_email}
                                        onChange={e => setForm(f => ({ ...f, admin_email: e.target.value }))}
                                        className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password (min 8 characters) *"
                                        required
                                        minLength={8}
                                        value={form.admin_password}
                                        onChange={e => setForm(f => ({ ...f, admin_password: e.target.value }))}
                                        className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                                    />
                                </div>
                            </div>

                            {/* Directory info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Directory Info</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <input
                                        type="text"
                                        placeholder='Directory name (e.g. "Austin Local Hub") *'
                                        required
                                        value={form.site_name}
                                        onChange={e => setForm(f => ({ ...f, site_name: e.target.value }))}
                                        className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                                    />
                                    <input
                                        type="text"
                                        placeholder='Location / region (e.g. "Austin, TX") *'
                                        required
                                        value={form.location_region}
                                        onChange={e => setForm(f => ({ ...f, location_region: e.target.value }))}
                                        className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Contact email (shown on site)"
                                        value={form.contact_email}
                                        onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                                        className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Contact phone"
                                        value={form.contact_phone}
                                        onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                                        className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                                    />
                                </div>
                            </div>

                            {/* Branding */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Brand Colors</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Primary color</label>
                                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2">
                                            <input
                                                type="color"
                                                value={form.primary_color}
                                                onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                                            />
                                            <span className="text-slate-300 text-sm font-mono">{form.primary_color}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Secondary color</label>
                                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2">
                                            <input
                                                type="color"
                                                value={form.secondary_color}
                                                onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                                            />
                                            <span className="text-slate-300 text-sm font-mono">{form.secondary_color}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">You can update logo, hero text, and all other branding in Settings after logging in.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition mt-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                {loading ? 'Setting up...' : 'Complete Setup'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
