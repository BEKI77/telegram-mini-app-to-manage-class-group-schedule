'use client';

import { format } from 'date-fns';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRawInitData } from '@tma.js/sdk-react';

export default function AssignmentsPage() {
    const [data, setData] = useState<{ upcoming: any[], past: any[] } | null>(null);
    const rawInitData = useRawInitData();

    useEffect(() => {
        async function load() {
            const headers = { 'X-Telegram-Init-Data': rawInitData || '' };

            try {
                const [upRes, paRes] = await Promise.all([
                    fetch('/api/assignments?status=upcoming', { headers }),
                    fetch('/api/assignments?status=past', { headers })
                ]);

                const [up, pa] = await Promise.all([upRes.json(), paRes.json()]);

                console.log('[Assignments Page] Fetched upcoming:', up);
                console.log('[Assignments Page] Fetched past:', pa);

                setData({ upcoming: up, past: pa });
            } catch (e) {
                console.error('[Assignments Page] Error:', e);
                setData({ upcoming: [], past: [] });
            }
        }
        load();
    }, [rawInitData]);

    if (!data) return <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>;
    const { upcoming, past } = data;

    return (
        <div className="space-y-6 pb-24 px-4 pt-4 max-w-md mx-auto h-full flex flex-col">
            <header className="flex flex-col space-y-1 shrink-0">
                <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
                    Assignments
                </h1>
                <p className="text-muted-foreground font-medium">Keep up the good work</p>
            </header>

            <Tabs defaultValue="upcoming" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2 mb-6 shrink-0 bg-secondary/50 p-1 rounded-xl">
                    <TabsTrigger value="upcoming" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">Due Soon</TabsTrigger>
                    <TabsTrigger value="past" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="flex-1 min-h-0 relative outline-none">
                    <AssignmentList assignments={upcoming} type="upcoming" />
                </TabsContent>

                <TabsContent value="past" className="flex-1 min-h-0 relative outline-none">
                    <AssignmentList assignments={past} type="past" />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function AssignmentList({ assignments, type }: { assignments: any[], type: 'upcoming' | 'past' }) {
    if (assignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center h-full">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4"
                >
                    <ClipboardList className="w-10 h-10 text-orange-500/50" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground">All Clear!</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                    {type === 'upcoming'
                        ? "No pending assignments."
                        : "No history found."}
                </p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-220px)] -mx-4 px-4">
            <div className="space-y-4 pb-32">
                <AnimatePresence>
                    {assignments.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="overflow-hidden border-0 bg-card/60 backdrop-blur-md shadow-sm ring-1 ring-border hover:ring-primary/50 transition-all group">
                                <CardContent className="p-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                                                {item.status === 'overdue' && (
                                                    <Badge variant="destructive" className="text-[10px] px-1.5 h-5 uppercase tracking-wide">Overdue</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-dashed border-border/50">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-secondary/80 px-2.5 py-1 rounded-md text-xs font-semibold text-secondary-foreground">{item.courseName}</span>
                                        </div>
                                        <div className={`text-xs font-bold flex items-center gap-1.5 ${item.status === 'overdue' ? 'text-destructive' :
                                            type === 'past' ? 'text-muted-foreground' : 'text-orange-500'
                                            }`}>
                                            {type === 'past' ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Completed</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>Due {format(new Date(item.dueDate), 'MMM d')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ScrollArea>
    );
}
