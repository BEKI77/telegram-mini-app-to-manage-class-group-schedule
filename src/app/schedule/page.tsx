'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRawInitData } from '@tma.js/sdk-react';

const days = [
    { value: '1', label: 'Mon' },
    { value: '2', label: 'Tue' },
    { value: '3', label: 'Wed' },
    { value: '4', label: 'Thu' },
    { value: '5', label: 'Fri' },
    { value: '6', label: 'Sat' }
];

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const rawInitData = useRawInitData();

    useEffect(() => {
        const headers = { 'X-Telegram-Init-Data': rawInitData || '' };

        fetch('/api/schedule', { headers })
            .then(res => res.json())
            .then(data => {
                console.log('[Schedule Page] Fetched schedule:', data);
                setSchedule(data);
                setIsLoading(false);
            })
            .catch((e) => {
                console.error('[Schedule Page] Error:', e);
                setIsLoading(false);
            });
    }, [rawInitData]);

    const currentDay = new Date().getDay().toString();
    const defaultTab = (currentDay === '0' || currentDay === '6') ? '1' : currentDay;

    if (isLoading) return <div className="p-8 flex justify-center text-muted-foreground">Loading...</div>;

    return (
        <div className="space-y-6 pb-24 px-4 pt-4 max-w-md mx-auto h-full flex flex-col">
            <header className="flex flex-col space-y-1 shrink-0">
                <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                    Weekly Plan
                </h1>
                <p className="text-muted-foreground font-medium">Weekly class schedule</p>
            </header>

            <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <TabsList className="w-full justify-start h-auto p-1 bg-transparent gap-3">
                        {days.map(day => (
                            <TabsTrigger
                                key={day.value}
                                value={day.value}
                                className="rounded-full w-12 h-12 p-0 flex flex-col items-center justify-center gap-0.5 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-110 transition-all border border-border bg-card/50"
                            >
                                <span className="text-[10px] uppercase font-bold opacity-70">{day.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="mt-2 flex-col min-h-0 relative">
                    {days.map(day => (
                        <TabsContent key={day.value} value={day.value} className="px-2">
                            <DayScheduleList schedule={schedule.filter((s: any) => s.dayOfWeek.toString() === day.value)} />
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}

function DayScheduleList({ schedule }: { schedule: any[] }) {
    if (schedule.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center h-full"
            >
                <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                    <CalendarDays className="w-10 h-10 text-teal-500/50" />
                </div>
                <h3 className="text-xl font-bold">Free Day!</h3>
                <p className="text-sm text-muted-foreground">Relax and recharge.</p>
            </motion.div>
        )
    }

    return (
        <div className="h-[calc(90vh-220px)] px-4 ">
            <div className="space-y-0 pb-32 relative">
                {schedule.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative pb-8 last:pb-0"
                    >

                        <div className="mb-2 flex items-baseline gap-2">
                            <span className="text-lg font-bold font-mono tracking-tight text-foreground">{item.startTime}</span>
                            <span className="text-xs font-semibold text-muted-foreground opacity-70">to {item.endTime}</span>
                        </div>

                        <Card className="relative border-0 bg-card/40 backdrop-blur-sm shadow-none ring-1 ring-border group hover:ring-teal-500/30 transition-all ">
                            <CardContent className="p-3">
                                <h3 className="font-bold text-lg group-hover:text-teal-500 transition-colors">{item.courseName}</h3>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                        <Badge variant="outline" className="text-[10px] h-4 px-1 p-0 border-0 text-foreground font-bold">{item.code}</Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{item.instructor}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
