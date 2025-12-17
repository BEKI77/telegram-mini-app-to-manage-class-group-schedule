'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Loader2, ExternalLink, Pencil } from 'lucide-react';

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string;
                openLink: (url: string) => void;
            };
        };
    }
}


export default function AcademicCalendarPage() {
    const [role, setRole] = useState<string | null>(null);
    const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [inputUrl, setInputUrl] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const initData = window.Telegram?.WebApp?.initData;

        // Debug
        if (typeof window !== 'undefined') {
            console.log('AcademicCalendar Page: initData found?', !!initData);
            if (initData) {
                const urlParams = new URLSearchParams(initData);
                const startParam = urlParams.get('start_param');
                console.log('AcademicCalendar Page: start_param:', startParam);
            }
        }

        const fetchData = async () => {
            // Parallel fetch
            try {
                const [roleRes, calendarRes] = await Promise.all([
                    fetch('/api/auth/role', {
                        headers: { 'X-Telegram-Init-Data': initData || '' }
                    }),
                    fetch('/api/calendar', {
                        headers: { 'X-Telegram-Init-Data': initData || '' }
                    })
                ]);

                if (roleRes.ok) {
                    const data = await roleRes.json();
                    setRole(data.role);
                }

                if (calendarRes.ok) {
                    const data = await calendarRes.json();
                    setCalendarUrl(data.url);
                    setInputUrl(data.url || '');
                }
            } catch (e) {
                console.error("Error fetching data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const initData = window.Telegram?.WebApp?.initData;
        try {
            const res = await fetch('/api/calendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Telegram-Init-Data': initData || ''
                },
                body: JSON.stringify({ url: inputUrl })
            });

            if (res.ok) {
                const data = await res.json();
                setCalendarUrl(data.url);
                setIsDialogOpen(false);
            } else {
                alert('Failed to save URL');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving URL');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenLink = () => {
        if (!calendarUrl) return;
        if (window.Telegram?.WebApp?.openLink) {
            window.Telegram.WebApp.openLink(calendarUrl);
        } else {
            window.open(calendarUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="animate-spin text-zinc-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Academic Calendar
                    <span className="text-xs font-mono text-zinc-600 ml-2 border border-zinc-800 rounded px-1">
                        {role || 'loading...'}
                    </span>
                </h1>
                {role === 'representative' && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="outline" className="rounded-full">
                                <Pencil size={18} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Calendar</DialogTitle>
                                <DialogDescription>
                                    Enter the URL for the Academic Calendar PDF (e.g., Google Drive link, public file URL).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="url">PDF URL</Label>
                                    <Input
                                        id="url"
                                        placeholder="https://example.com/calendar.pdf"
                                        value={inputUrl}
                                        onChange={(e) => setInputUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card className="flex-1 overflow-hidden border-zinc-800 bg-black/50 backdrop-blur">
                <CardContent className="p-0 h-[65vh] flex flex-col items-center justify-center relative">
                    {calendarUrl ? (
                        <>
                            <iframe
                                src={calendarUrl.includes('drive.google.com') && !calendarUrl.includes('preview')
                                    ? calendarUrl.replace('/view', '/preview')
                                    : calendarUrl}
                                className="w-full h-full border-none"
                                title="Academic Calendar"
                            />
                            {/* Overlay button for external open */}
                            <div className="absolute bottom-4 right-4">
                                <Button onClick={handleOpenLink} variant="secondary" className="shadow-lg backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10">
                                    <ExternalLink className="mr-2" size={16} />
                                    Open Fullscreen
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-zinc-500 gap-4 p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                                <FileText size={32} />
                            </div>
                            <p>No academic calendar has been uploaded yet.</p>
                            {role === 'representative' && (
                                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                                    Add Calendar PDF
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
