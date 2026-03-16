'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function StatusPage() {
    const [checking, setChecking] = useState(false);
    const [status, setStatus] = useState<{api: boolean; db: boolean} | null>(null);

    const checkStatus = async () => {
        setChecking(true);
        try {
            // Test API
            const apiRes = await fetch('/api/health');
            const apiData = await apiRes.json();
            
            setStatus({
                api: apiRes.ok,
                db: apiData.db || false
            });
        } catch (err) {
            setStatus({ api: false, db: false });
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-4">Site Status</h1>
                    <p className="text-slate-400">Check if all systems are operational</p>
                </div>

                <div className="glass rounded-2xl p-8 border border-slate-700">
                    <button
                        onClick={checkStatus}
                        disabled={checking}
                        className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl mb-6 transition"
                    >
                        {checking ? 'Checking...' : 'Check Status'}
                    </button>

                    {status && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800">
                                {status.api ? (
                                    <CheckCircle className="text-emerald-400" size={24} />
                                ) : (
                                    <AlertCircle className="text-red-400" size={24} />
                                )}
                                <div>
                                    <p className="font-bold text-white">API</p>
                                    <p className="text-sm text-slate-400">
                                        {status.api ? 'Operational' : 'Configuration Required'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800">
                                {status.db ? (
                                    <CheckCircle className="text-emerald-400" size={24} />
                                ) : (
                                    <AlertCircle className="text-red-400" size={24} />
                                )}
                                <div>
                                    <p className="font-bold text-white">Database</p>
                                    <p className="text-sm text-slate-400">
                                        {status.db ? 'Connected' : 'Run migrations required'}
                                    </p>
                                </div>
                            </div>

                            {!status.api && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-amber-400 text-sm">
                                        ⚠️ Some features require environment variables to be set in Vercel.
                                        Contact the site administrator.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Having trouble? Contact support at{' '}
                        <a href="mailto:support@thetrianglehub.online" className="text-primary-400 hover:underline">
                            support@thetrianglehub.online
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
