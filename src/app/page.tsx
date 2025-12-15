'use client';

import { format } from 'date-fns';
import { Clock, MapPin, Calendar as CalendarIcon, BookOpen, Megaphone, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRawInitData, initData, useSignal } from '@tma.js/sdk-react';

export default function Home() {
  const [data, setData] = useState<{ schedule: any[], assignments: any[], announcements: any[] } | null>(null);
  const [role, setRole] = useState<'student' | 'representative' | 'admin'>('student');
  const rawInitData = useRawInitData();
  const user = useSignal(initData.user);

  // Helper to truncate long names
  const truncateName = (name: string | undefined, maxLength: number = 12) => {
    if (!name) return 'Scholar';
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  useEffect(() => {
    async function load() {
      const todayDay = new Date().getDay();

      // Get initData from the SDK
      const initData = rawInitData || '';

      console.log('[Frontend] rawInitData available:', !!rawInitData);
      console.log('[Frontend] initData length:', initData.length);
      console.log('[Frontend] initData:', initData);

      try {
        const [schRes, assRes, annRes, roleRes] = await Promise.all([
          fetch(`/api/schedule?day=${todayDay}`, { headers: { 'X-Telegram-Init-Data': initData } }),
          fetch('/api/assignments?status=upcoming', { headers: { 'X-Telegram-Init-Data': initData } }),
          fetch('/api/announcements', { headers: { 'X-Telegram-Init-Data': initData } }),
          fetch('/api/auth/role', {
            headers: { 'X-Telegram-Init-Data': initData }
          })
        ]);

        const [sch, ass, ann, roleData] = await Promise.all([
          schRes.json(),
          assRes.json(),
          annRes.json(),
          roleRes.json()
        ]);

        console.log('[Frontend] Schedule data:', sch);
        console.log('[Frontend] Assignments data:', ass);
        console.log('[Frontend] Announcements data:', ann);
        console.log('[Frontend] Role data:', roleData);

        setData({ schedule: sch, assignments: ass, announcements: ann });
        if (roleData?.role) setRole(roleData.role);
      } catch (e) {
        console.error(e);
        setData({ schedule: [], assignments: [], announcements: [] });
      }
    }
    load();
  }, [rawInitData]);

  const todayDate = format(new Date(), 'EEEE, MMMM d');

  if (!data) return <div className="p-8 flex justify-center"><div className="animate-pulse text-muted-foreground">Loading dashboard...</div></div>;

  const { schedule, assignments, announcements } = data;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-32 px-5 pt-8 max-w-md mx-auto"
    >
      {/* Header */}
      <motion.header variants={item} className="flex justify-between items-start">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 dark:from-blue-300 dark:to-indigo-400">
            Hello, {truncateName(user?.first_name)}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">{todayDate}</p>
        </div>

        {role === 'representative' && (
          <Link href="/manage">
            <Button variant="outline" size="sm" className="bg-background/50 backdrop-blur-md border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10">
              Manage
            </Button>
          </Link>
        )}
      </motion.header>

      {/* Today's Schedule */}
      <motion.section variants={item} className="space-y-4">
        <Link href="/schedule" className="flex items-center justify-between group">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold tracking-tight">Today's Classes</h2>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">View full &rarr;</span>
        </Link>

        {schedule.length === 0 ? (
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-dashed border-indigo-500/20">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
                <CalendarIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-base text-foreground font-medium">No classes today</p>
              <p className="text-xs text-muted-foreground">Enjoy your free time!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {schedule.map((item: any) => (
              <motion.div key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="relative overflow-hidden border-0 bg-secondary/30 backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600" />
                  <CardContent className="p-5 flex justify-between items-start">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-xl leading-none tracking-tight">{item.courseName}</h3>
                      <div className="flex items-center text-xs font-medium text-muted-foreground space-x-2">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20">{item.code}</span>
                        <span>{item.instructor}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-xl tabular-nums tracking-tight text-foreground">{item.startTime}</div>
                      <div className="text-xs text-muted-foreground tabular-nums opacity-70">{item.endTime}</div>
                    </div>
                  </CardContent>
                  <div className="px-5 py-2 bg-black/20 flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                    {item.location}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Upcoming Assignments */}
      <motion.section variants={item} className="space-y-4">
        <Link href="/assignments" className="flex items-center justify-between group">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold tracking-tight">Assignments</h2>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">See all &rarr;</span>
        </Link>

        {assignments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-center">
            <CheckCircle2 className="w-8 h-8 text-orange-500/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming tasks!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {assignments.slice(0, 3).map((item: any) => (
              <Card key={item.id} className="border-0 bg-card/50 shadow-sm ring-1 ring-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{item.courseName}</p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 shadow-none border-0">
                    {format(new Date(item.dueDate), 'MMM d')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.section variants={item} className="space-y-3">
          <div className="flex items-center space-x-2 text-pink-500">
            <Megaphone className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-80">Announcements</h2>
          </div>
          {announcements.map((item: any) => (
            <div key={item.id} className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/5 border border-pink-500/10">
              <h4 className="font-bold text-sm text-pink-200">{item.title}</h4>
              <p className="text-sm mt-1 text-muted-foreground leading-relaxed">{item.content}</p>
            </div>
          ))}
        </motion.section>
      )}

    </motion.div>
  );
}
