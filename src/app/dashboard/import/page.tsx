'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Mail, Loader2, Download, Trash2, ChevronRight } from 'lucide-react';

interface ParsedRow {
    name: string;
    category: string;
    description?: string;
    location_city?: string;
    location_state?: string;
    contact_email?: string;
    rating?: string;
    [key: string]: string | undefined;
}

interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    skipped: number;
    errors: string[];
    listings: { name: string; slug: string; hadEmail: boolean }[];
}

const REQUIRED_COLUMNS = ['name'];
const OPTIONAL_COLUMNS = ['category', 'description', 'location_city', 'location_state', 'contact_email', 'rating'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

const SAMPLE_CSV = `name,category,description,location_city,location_state,contact_email,rating
Triangle Wellness Spa,Med Spa,Premier wellness and med spa services in Raleigh,Raleigh,NC,hello@trianglewellness.com,4.8
Oak City Plumbing,Plumbing,Residential and commercial plumbing services,Durham,NC,info@oakcityplumbing.com,4.5
Cary Pet Grooming,Pet Services,Full-service grooming for dogs and cats,Cary,NC,,4.6
Triangle HVAC Pros,HVAC,Heating and cooling installation and repair,Raleigh,NC,service@trianglehvac.com,4.7`;

function parseCSV(text: string): ParsedRow[] {
    const lines = text.trim().split('\n').map(l => l.replace(/\r/g, ''));
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        // Handle quoted values with commas inside
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const ch of lines[i]) {
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        values.push(current.trim());

        const row: ParsedRow = { name: '', category: '' };
        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        rows.push(row);
    }
    return rows;
}

export default function ImportPage() {
    const [dragging, setDragging] = useState(false);
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [fileName, setFileName] = useState('');
    const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [parseError, setParseError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            setParseError('Please upload a CSV file.');
            return;
        }
        setParseError('');
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const parsed = parseCSV(text);
                if (parsed.length === 0) {
                    setParseError('No data rows found. Make sure your CSV has a header row and at least one data row.');
                    return;
                }
                const missing = REQUIRED_COLUMNS.filter(col => !Object.keys(parsed[0]).includes(col));
                if (missing.length > 0) {
                    setParseError(`Missing required columns: ${missing.join(', ')}. Please check your CSV headers.`);
                    return;
                }
                setRows(parsed);
                setStep('preview');
            } catch {
                setParseError('Failed to parse CSV. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleImport = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows }),
            });
            const data = await res.json();
            setResult(data);
            setStep('result');
        } catch {
            setResult({ success: false, message: 'Network error. Please try again.', imported: 0, skipped: 0, errors: [], listings: [] });
            setStep('result');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setRows([]);
        setFileName('');
        setStep('upload');
        setResult(null);
        setParseError('');
    };

    const removeRow = (idx: number) => {
        setRows(prev => prev.filter((_, i) => i !== idx));
    };

    const downloadSample = () => {
        const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_import.csv';
        a.click();
    };

    const withEmailCount = rows.filter(r => r.contact_email).length;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bulk Business Import</h1>
                    <p className="text-sm text-slate-500 mt-1">Upload a CSV to add free listings and enroll them in the outreach email funnel automatically.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={downloadSample}
                        className="flex items-center text-sm px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
                    >
                        <Download size={15} className="mr-2" />
                        Sample CSV
                    </button>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 text-sm font-medium">
                {['upload', 'preview', 'result'].map((s, i) => {
                    const labels = ['Upload File', 'Review & Confirm', 'Import Complete'];
                    const isActive = step === s;
                    const isPast = ['upload', 'preview', 'result'].indexOf(step) > i;
                    return (
                        <div key={s} className="flex items-center gap-2">
                            {i > 0 && <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isActive ? 'bg-primary-600 text-white' : isPast ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {isPast && !isActive ? <CheckCircle2 size={13} /> : <span className="w-4 h-4 text-xs flex items-center justify-center font-bold">{i + 1}</span>}
                                <span className="hidden sm:inline">{labels[i]}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* STEP 1: Upload */}
            {step === 'upload' && (
                <div className="space-y-6">
                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center py-20 px-8 text-center select-none
                            ${dragging
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors ${dragging ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <Upload size={28} className={dragging ? 'text-primary-600' : 'text-slate-400'} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            {dragging ? 'Drop your CSV here!' : 'Drag & drop your CSV file'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">or click to browse files</p>
                        <span className="inline-block bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
                            Choose File
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                    </div>

                    {parseError && (
                        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm">
                            <XCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{parseError}</span>
                        </div>
                    )}

                    {/* Column Guide */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <FileSpreadsheet size={18} className="text-primary-500" />
                            Expected CSV Columns
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ALL_COLUMNS.map(col => {
                                const isRequired = REQUIRED_COLUMNS.includes(col);
                                return (
                                    <div key={col} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-lg">
                                        <code className="text-primary-600 dark:text-primary-400 font-mono text-sm flex-1">{col}</code>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isRequired ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                            {isRequired ? 'Required' : 'Optional'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                            <Mail size={12} />
                            Rows with a <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">contact_email</code> will be enrolled in the automated email outreach funnel.
                        </p>
                    </div>
                </div>
            )}

            {/* STEP 2: Preview */}
            {step === 'preview' && (
                <div className="space-y-5">
                    {/* Summary bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Rows', value: rows.length, color: 'blue' },
                            { label: 'Have Email', value: withEmailCount, color: 'emerald' },
                            { label: 'No Email', value: rows.length - withEmailCount, color: 'amber' },
                            { label: 'Will Be Created', value: rows.length, color: 'purple' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm`}>
                                <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</div>
                                <div className="text-xs text-slate-500 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <FileSpreadsheet size={16} />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{fileName}</span>
                            <span>— {rows.length} businesses ready to import</span>
                        </div>
                        <button onClick={reset} className="text-sm text-slate-400 hover:text-red-500 transition flex items-center gap-1">
                            <Trash2 size={14} /> Clear
                        </button>
                    </div>

                    {/* Table Preview */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-950">
                                    <tr>
                                        <th className="px-4 py-3 w-8">#</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">City</th>
                                        <th className="px-4 py-3">State</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Rating</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {rows.map((row, i) => {
                                        const missing = REQUIRED_COLUMNS.filter(c => !row[c]);
                                        const hasError = missing.length > 0;
                                        return (
                                            <tr key={i} className={`transition-colors ${hasError ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {hasError && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                                                        <span className={`font-medium ${hasError ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>{row.name || <em className="text-red-400">missing</em>}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {row.category
                                                        ? <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded text-xs font-medium">{row.category}</span>
                                                        : <em className="text-red-400">missing</em>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{row.location_city || '—'}</td>
                                                <td className="px-4 py-3 text-slate-500">{row.location_state || 'NC'}</td>
                                                <td className="px-4 py-3">
                                                    {row.contact_email
                                                        ? <span className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400"><Mail size={12} />{row.contact_email}</span>
                                                        : <span className="text-slate-300 dark:text-slate-600 text-xs">No email</span>}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{row.rating || '4.0'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-primary-700 p-5 rounded-2xl text-white shadow-lg shadow-primary-700/20">
                        <div>
                            <p className="font-semibold text-lg">Ready to import {rows.length} businesses?</p>
                            <p className="text-primary-200 text-sm mt-0.5">
                                {withEmailCount > 0 ? `${withEmailCount} will be enrolled in email outreach automatically.` : 'Add contact_email column to enroll businesses in outreach.'}
                            </p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <button onClick={reset} className="px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={loading || rows.length === 0}
                                className="flex items-center px-6 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-lg text-sm font-bold transition shadow-md disabled:opacity-60"
                            >
                                {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                                {loading ? 'Importing...' : 'Confirm Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: Result */}
            {step === 'result' && result && (
                <div className="space-y-6">
                    {/* Hero result */}
                    <div className={`rounded-2xl p-8 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xl ${result.success ? 'bg-gradient-to-r from-secondary-600 to-secondary-500 shadow-secondary-700/20' : 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-700/20'}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${result.success ? 'bg-white/20' : 'bg-white/20'}`}>
                            {result.success ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{result.message}</h2>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                <span className="bg-white/20 px-3 py-1 rounded-full">{result.imported} imported</span>
                                {result.skipped > 0 && <span className="bg-white/20 px-3 py-1 rounded-full">{result.skipped} skipped</span>}
                                <span className="bg-white/20 px-3 py-1 rounded-full">{result.listings.filter(l => l.hadEmail).length} enrolled in CRM</span>
                            </div>
                        </div>
                    </div>

                    {/* Imported listings */}
                    {result.listings.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-secondary-500" />
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Successfully Imported</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                                        <tr>
                                            <th className="px-6 py-3">Business Name</th>
                                            <th className="px-6 py-3">URL Slug</th>
                                            <th className="px-6 py-3">Email Outreach</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {result.listings.map((l, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{l.name}</td>
                                                <td className="px-6 py-3">
                                                    <a href={`/biz/${l.slug}`} target="_blank" rel="noreferrer" className="font-mono text-primary-600 dark:text-primary-400 hover:underline text-xs">/biz/{l.slug}</a>
                                                </td>
                                                <td className="px-6 py-3">
                                                    {l.hadEmail
                                                        ? <span className="inline-flex items-center gap-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 text-xs font-medium px-2.5 py-1 rounded-full"><Mail size={11} /> Enrolled</span>
                                                        : <span className="text-slate-300 dark:text-slate-600 text-xs">No email — skipped</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Errors */}
                    {result.errors.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3">
                                <AlertTriangle size={16} /> Skipped Rows
                            </h4>
                            <ul className="space-y-1">
                                {result.errors.map((e, i) => (
                                    <li key={i} className="text-sm text-amber-700 dark:text-amber-400">{e}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={reset} className="flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition shadow-md">
                            <Upload size={15} className="mr-2" /> Import Another File
                        </button>
                        <a href="/dashboard/leads" className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            View CRM Pipeline →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
