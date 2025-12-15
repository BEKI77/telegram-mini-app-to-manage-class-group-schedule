'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRawInitData } from '@tma.js/sdk-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const rawInitData = useRawInitData();

    useEffect(() => {
        const headers = { 'X-Telegram-Init-Data': rawInitData || '' };

        fetch('/api/courses', { headers })
            .then(res => res.json())
            .then(data => {
                console.log('[Courses Page] Fetched courses:', data);
                setCourses(data);
                setLoading(false);
            })
            .catch((e) => {
                console.error('[Courses Page] Error:', e);
                setLoading(false);
            });
    }, [rawInitData]);

    if (loading) return <div className="p-8 flex justify-center text-muted-foreground">Loading courses...</div>;

    return (
        <div className="space-y-6 pb-24 px-4 pt-4 max-w-md mx-auto h-full flex flex-col">
            <header className="flex flex-col space-y-1 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    My Courses
                </h1>
                <p className="text-muted-foreground font-medium">Enrolled classes</p>
            </header>

            <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-3 pb-20 mt-2">
                    {courses.map((course: any) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="p-4 bg-muted/20 pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="bg-background">{course.code}</Badge>
                                </div>
                                <CardTitle className="text-lg leading-tight mt-1">{course.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <User className="w-4 h-4" />
                                    <span>{course.instructor || 'TBA'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
