'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRawInitData } from '@tma.js/sdk-react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, FileText, CheckCircle2, AlertCircle, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Assignment = {
    id: number;
    title: string;
    description: string | null;
    dueDate: string;
    courseName: string;
    status: string;
    attachmentUrl: string | null;
};

export default function AssignmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const rawInitData = useRawInitData();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);

    const id = params.id as string;

    useEffect(() => {
        if (!id || !rawInitData) return;

        async function fetchAssignment() {
            try {
                const res = await fetch(`/api/assignments?id=${id}`, {
                    headers: { 'X-Telegram-Init-Data': rawInitData || '' }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAssignment(data);
                } else {
                    console.error('Failed to fetch assignment');
                }
            } catch (e) {
                console.error('Error fetching assignment:', e);
            } finally {
                setLoading(false);
            }
        }

        fetchAssignment();
    }, [id, rawInitData]);

    const handleOpenPdf = () => {
        if (!assignment?.attachmentUrl) return;

        if (window.Telegram?.WebApp?.openLink) {
            window.Telegram.WebApp.openLink(assignment.attachmentUrl);
        } else {
            window.open(assignment.attachmentUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="w-8 h-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full gap-4">
                <p>Assignment not found.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const isOverdue = assignment.status === 'overdue';
    const isCompleted = assignment.status === 'completed';

    return (
        <div className="flex flex-col h-full bg-background space-y-6 pb-24 px-4 pt-4 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary border border-white/5"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent line-clamp-1">
                    Assignment Details
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                {/* Main Card */}
                <Card className="border-0 bg-secondary/20 backdrop-blur-md shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${isOverdue ? 'from-red-500 to-red-600' :
                            isCompleted ? 'from-green-500 to-emerald-600' :
                                'from-orange-500 to-amber-600'
                        }`} />
                    <CardContent className="p-6 space-y-6">
                        {/* Title & Course */}
                        <div>
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center w-fit">
                                    <BookOpen size={12} className="mr-1.5" />
                                    {assignment.courseName}
                                </Badge>

                                {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                                {isCompleted && <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>}
                            </div>
                            <h2 className="text-2xl font-bold leading-tight">{assignment.title}</h2>
                        </div>

                        {/* Due Date & Status */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-background/40 border border-white/5">
                            <div className={`p-3 rounded-full ${isOverdue ? 'bg-red-500/10 text-red-500' :
                                    isCompleted ? 'bg-green-500/10 text-green-500' :
                                        'bg-orange-500/10 text-orange-500'
                                }`}>
                                {isOverdue ? <AlertCircle size={24} /> :
                                    isCompleted ? <CheckCircle2 size={24} /> :
                                        <Calendar size={24} />
                                }
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Due Date</p>
                                <p className="font-semibold text-lg">
                                    {format(new Date(assignment.dueDate), 'MMMM d, yyyy')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(assignment.dueDate), 'h:mm a')}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {assignment.description && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</h3>
                                <p className="text-base leading-relaxed text-zinc-300">
                                    {assignment.description}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* PDF Viewer / Attachment */}
                {assignment.attachmentUrl ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">Attachment</h3>
                            <Button variant="link" size="sm" onClick={handleOpenPdf} className="h-auto p-0 text-blue-400">
                                Open Fullscreen <ExternalLink size={12} className="ml-1" />
                            </Button>
                        </div>
                        <Card className="overflow-hidden border-zinc-800 bg-black/50 h-[400px]">
                            <iframe
                                src={assignment.attachmentUrl.includes('drive.google.com') && !assignment.attachmentUrl.includes('preview')
                                    ? assignment.attachmentUrl.replace('/view', '/preview')
                                    : assignment.attachmentUrl}
                                className="w-full h-full border-none"
                                title="Assignment PDF"
                            />
                        </Card>
                    </div>
                ) : (
                    <div className="p-8 rounded-xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 gap-2">
                        <FileText size={32} />
                        <p className="text-sm">No attachments available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
