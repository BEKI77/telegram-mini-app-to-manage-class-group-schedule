'use client';

import { useEffect, useState } from 'react';
import { useRawInitData } from '@tma.js/sdk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, BookOpen, Calendar, FileText, Megaphone, X, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

type Course = {
    id: number;
    name: string;
    code: string | null;
    instructor: string | null;
};

type Schedule = {
    id: number;
    courseId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location: string | null;
    courseName?: string;
};

type Assignment = {
    id: number;
    courseId: number;
    title: string;
    description: string | null;
    dueDate: string;
    status: string;
    courseName?: string;
    attachmentUrl?: string | null;
};

type Announcement = {
    id: number;
    content: string;
    courseId: number | null;
    createdAt: string;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ManagePage() {
    const rawInitData = useRawInitData();
    const [courses, setCourses] = useState<Course[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [showCourseForm, setShowCourseForm] = useState(false);

    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [showScheduleForm, setShowScheduleForm] = useState(false);

    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);

    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

    const headers = { 'X-Telegram-Init-Data': rawInitData || '' };

    useEffect(() => {
        loadData();
    }, [rawInitData]);

    async function loadData() {
        try {
            const [coursesRes, schedulesRes, assignmentsRes, announcementsRes] = await Promise.all([
                fetch('/api/courses', { headers }),
                fetch('/api/schedule', { headers }),
                fetch('/api/assignments', { headers }),
                fetch('/api/announcements', { headers }),
            ]);

            const [c, s, a, an] = await Promise.all([
                coursesRes.json(),
                schedulesRes.json(),
                assignmentsRes.json(),
                announcementsRes.json(),
            ]);

            setCourses(c);
            setSchedules(s);
            setAssignments(a);
            setAnnouncements(an);
        } catch (e) {
            console.error('Failed to load data:', e);
        } finally {
            setLoading(false);
        }
    }

    async function deleteCourse(id: number) {
        if (!confirm('Delete this course? This will also delete all associated schedules and assignments.')) return;
        try {
            const res = await fetch(`/api/courses?id=${id}`, { method: 'DELETE', headers });
            if (res.ok) setCourses(courses.filter(c => c.id !== id));
            else alert('Failed to delete course');
        } catch (e) {
            console.error('Delete error:', e);
        }
    }

    async function deleteSchedule(id: number) {
        if (!confirm('Delete this schedule entry?')) return;
        try {
            const res = await fetch(`/api/schedule?id=${id}`, { method: 'DELETE', headers });
            if (res.ok) setSchedules(schedules.filter(s => s.id !== id));
            else alert('Failed to delete schedule');
        } catch (e) {
            console.error('Delete error:', e);
        }
    }

    async function deleteAssignment(id: number) {
        if (!confirm('Delete this assignment?')) return;
        try {
            const res = await fetch(`/api/assignments?id=${id}`, { method: 'DELETE', headers });
            if (res.ok) setAssignments(assignments.filter(a => a.id !== id));
            else alert('Failed to delete assignment');
        } catch (e) {
            console.error('Delete error:', e);
        }
    }

    async function deleteAnnouncement(id: number) {
        if (!confirm('Delete this announcement?')) return;
        try {
            const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE', headers });
            if (res.ok) setAnnouncements(announcements.filter(a => a.id !== id));
            else alert('Failed to delete announcement');
        } catch (e) {
            console.error('Delete error:', e);
        }
    }

    async function saveCourse(data: Partial<Course>) {
        try {
            const method = editingCourse ? 'PUT' : 'POST';
            const body = editingCourse ? { ...data, id: editingCourse.id } : data;
            const res = await fetch('/api/courses', {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const saved = await res.json();
                if (editingCourse) setCourses(courses.map(c => c.id === saved.id ? saved : c));
                else setCourses([...courses, saved]);
                setShowCourseForm(false);
                setEditingCourse(null);
            } else alert('Failed to save course');
        } catch (e) {
            console.error('Save error:', e);
        }
    }

    async function saveSchedule(data: Partial<Schedule>) {
        try {
            const method = editingSchedule ? 'PUT' : 'POST';
            const body = editingSchedule ? { ...data, id: editingSchedule.id } : data;
            const res = await fetch('/api/schedule', {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                await loadData(); // Reload to get courseName
                setShowScheduleForm(false);
                setEditingSchedule(null);
            } else alert('Failed to save schedule');
        } catch (e) {
            console.error('Save error:', e);
        }
    }

    async function saveAssignment(data: Partial<Assignment>) {
        try {
            const method = editingAssignment ? 'PUT' : 'POST';
            const body = editingAssignment ? { ...data, id: editingAssignment.id } : data;
            const res = await fetch('/api/assignments', {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                await loadData();
                setShowAssignmentForm(false);
                setEditingAssignment(null);
            } else alert('Failed to save assignment');
        } catch (e) {
            console.error('Save error:', e);
        }
    }

    async function saveAnnouncement(data: Partial<Announcement>) {
        try {
            const method = editingAnnouncement ? 'PUT' : 'POST';
            const body = editingAnnouncement ? { ...data, id: editingAnnouncement.id } : data;
            const res = await fetch('/api/announcements', {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const saved = await res.json();
                if (editingAnnouncement) setAnnouncements(announcements.map(a => a.id === saved.id ? saved : a));
                else setAnnouncements([saved, ...announcements]);
                setShowAnnouncementForm(false);
                setEditingAnnouncement(null);
            } else alert('Failed to save announcement');
        } catch (e) {
            console.error('Save error:', e);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </motion.div>
            </div>
        );
    }

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    const FormCard = ({ title, onClose, children, gradient }: any) => (
        <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
            <Card className={`border-0 bg-gradient-to-br ${gradient} backdrop-blur-sm shadow-xl ring-1 ring-white/10`}>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center justify-between">
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{title}</span>
                        <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0 hover:bg-white/10">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </motion.div>
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="min-h-screen pb-24 px-4 pt-8 max-w-3xl mx-auto">
            <motion.header variants={item} className="mb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10" />
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">Manage Class</h1>
                    <p className="text-muted-foreground font-medium">Representative Dashboard</p>
                </div>
            </motion.header>

            <motion.div variants={item}>
                <Tabs defaultValue="courses" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-secondary/50 backdrop-blur-md p-1 rounded-xl border border-white/10">
                        <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-blue-300 rounded-lg transition-all">
                            <BookOpen className="w-4 h-4 mr-1.5" /><span className="hidden sm:inline">Courses</span>
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-green-300 rounded-lg transition-all">
                            <Calendar className="w-4 h-4 mr-1.5" /><span className="hidden sm:inline">Schedule</span>
                        </TabsTrigger>
                        <TabsTrigger value="assignments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-amber-500/20 data-[state=active]:text-orange-300 rounded-lg transition-all">
                            <FileText className="w-4 h-4 mr-1.5" /><span className="hidden sm:inline">Tasks</span>
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/20 data-[state=active]:to-rose-500/20 data-[state=active]:text-pink-300 rounded-lg transition-all">
                            <Megaphone className="w-4 h-4 mr-1.5" /><span className="hidden sm:inline">News</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Courses Tab */}
                    <TabsContent value="courses" className="space-y-4 mt-6">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => { setEditingCourse(null); setShowCourseForm(true); }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 border-0">
                                <Plus className="mr-2 h-4 w-4" /> Add New Course
                            </Button>
                        </motion.div>

                        <AnimatePresence>
                            {showCourseForm && (
                                <FormCard title={editingCourse ? 'Edit Course' : 'New Course'} onClose={() => { setShowCourseForm(false); setEditingCourse(null); }} gradient="from-blue-500/10 to-indigo-500/10">
                                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveCourse({ name: fd.get('name') as string, code: fd.get('code') as string, instructor: fd.get('instructor') as string }); }} className="space-y-3">
                                        <input name="name" placeholder="Course Name" defaultValue={editingCourse?.name || ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none" />
                                        <input name="code" placeholder="Course Code (e.g., CS101)" defaultValue={editingCourse?.code || ''} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none" />
                                        <input name="instructor" placeholder="Instructor Name" defaultValue={editingCourse?.instructor || ''} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none" />
                                        <div className="flex gap-2 pt-2">
                                            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0"><Check className="mr-2 h-4 w-4" /> Save</Button>
                                            <Button type="button" variant="outline" onClick={() => { setShowCourseForm(false); setEditingCourse(null); }} className="flex-1 border-white/10 hover:bg-white/5">Cancel</Button>
                                        </div>
                                    </form>
                                </FormCard>
                            )}
                        </AnimatePresence>

                        {courses.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4"><BookOpen className="w-10 h-10 text-blue-400" /></div>
                                <p className="text-muted-foreground">No courses yet</p>
                                <p className="text-sm text-muted-foreground/60">Add your first course to get started</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {courses.map((course, index) => (
                                        <motion.div key={course.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
                                            <Card className="border-0 bg-secondary/30 backdrop-blur-sm shadow-lg ring-1 ring-white/10 overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
                                                <CardContent className="p-4 flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg mb-1">{course.name}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            {course.code && <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">{course.code}</span>}
                                                            <span>{course.instructor || 'No instructor'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="sm" variant="outline" onClick={() => { setEditingCourse(course); setShowCourseForm(true); }} className="h-9 w-9 p-0 border-white/10 hover:bg-blue-500/20 hover:border-blue-500/30"><Edit className="w-4 h-4" /></Button>
                                                        <Button size="sm" variant="outline" onClick={() => deleteCourse(course.id)} className="h-9 w-9 p-0 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </TabsContent>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule" className="space-y-4 mt-6">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => { setEditingSchedule(null); setShowScheduleForm(true); }} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/25 border-0" disabled={courses.length === 0}>
                                <Plus className="mr-2 h-4 w-4" /> Add Schedule Entry
                            </Button>
                        </motion.div>

                        <AnimatePresence>
                            {showScheduleForm && (
                                <FormCard title={editingSchedule ? 'Edit Schedule' : 'New Schedule'} onClose={() => { setShowScheduleForm(false); setEditingSchedule(null); }} gradient="from-green-500/10 to-emerald-500/10">
                                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveSchedule({ courseId: parseInt(fd.get('courseId') as string), dayOfWeek: parseInt(fd.get('dayOfWeek') as string), startTime: fd.get('startTime') as string, endTime: fd.get('endTime') as string, location: fd.get('location') as string }); }} className="space-y-3">
                                        <select name="courseId" defaultValue={editingSchedule?.courseId || ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none">
                                            <option value="">Select Course</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <select name="dayOfWeek" defaultValue={editingSchedule?.dayOfWeek ?? ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none">
                                            <option value="">Select Day</option>
                                            {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
                                        </select>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="time" name="startTime" defaultValue={editingSchedule?.startTime || ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none" />
                                            <input type="time" name="endTime" defaultValue={editingSchedule?.endTime || ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none" />
                                        </div>
                                        <input name="location" placeholder="Location (optional)" defaultValue={editingSchedule?.location || ''} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none" />
                                        <div className="flex gap-2 pt-2">
                                            <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-0"><Check className="mr-2 h-4 w-4" /> Save</Button>
                                            <Button type="button" variant="outline" onClick={() => { setShowScheduleForm(false); setEditingSchedule(null); }} className="flex-1 border-white/10 hover:bg-white/5">Cancel</Button>
                                        </div>
                                    </form>
                                </FormCard>
                            )}
                        </AnimatePresence>

                        {schedules.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4"><Calendar className="w-10 h-10 text-green-400" /></div>
                                <p className="text-muted-foreground">No schedule entries yet</p>
                            </div>
                        ) : (
                            schedules.map((s, index) => (
                                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02 }}>
                                    <Card className="border-0 bg-secondary/30 backdrop-blur-sm shadow-lg ring-1 ring-white/10 overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-600" />
                                        <CardContent className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-lg">{s.courseName}</p>
                                                <p className="text-sm text-muted-foreground">{DAYS[s.dayOfWeek]} • {s.startTime} - {s.endTime}</p>
                                                {s.location && <p className="text-sm text-muted-foreground/70">{s.location}</p>}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" onClick={() => { setEditingSchedule(s); setShowScheduleForm(true); }} className="h-9 w-9 p-0 border-white/10 hover:bg-green-500/20 hover:border-green-500/30"><Edit className="w-4 h-4" /></Button>
                                                <Button size="sm" variant="outline" onClick={() => deleteSchedule(s.id)} className="h-9 w-9 p-0 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </TabsContent>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments" className="space-y-4 mt-6">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => { setEditingAssignment(null); setShowAssignmentForm(true); }} className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-500/25 border-0" disabled={courses.length === 0}>
                                <Plus className="mr-2 h-4 w-4" /> Add Assignment
                            </Button>
                        </motion.div>

                        <AnimatePresence>
                            {showAssignmentForm && (
                                <FormCard title={editingAssignment ? 'Edit Assignment' : 'New Assignment'} onClose={() => { setShowAssignmentForm(false); setEditingAssignment(null); }} gradient="from-orange-500/10 to-amber-500/10">
                                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveAssignment({ courseId: parseInt(fd.get('courseId') as string), title: fd.get('title') as string, description: fd.get('description') as string, dueDate: fd.get('dueDate') as string, attachmentUrl: fd.get('attachmentUrl') as string, status: fd.get('status') as string }); }} className="space-y-3">
                                        <select name="courseId" defaultValue={editingAssignment?.courseId || ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none">
                                            <option value="">Select Course</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <input name="title" placeholder="Assignment Title" defaultValue={editingAssignment?.title || ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none" />
                                        <textarea name="description" placeholder="Description (optional)" defaultValue={editingAssignment?.description || ''} rows={3} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none resize-none" />
                                        <input type="datetime-local" name="dueDate" defaultValue={editingAssignment?.dueDate?.slice(0, 16) || ''} required className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none" />
                                        <input name="attachmentUrl" placeholder="Attachment URL (PDF)" defaultValue={editingAssignment?.attachmentUrl || ''} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none" />
                                        <select name="status" defaultValue={editingAssignment?.status || 'upcoming'} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none">
                                            <option value="upcoming">Upcoming</option>
                                            <option value="overdue">Overdue</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <div className="flex gap-2 pt-2">
                                            <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border-0"><Check className="mr-2 h-4 w-4" /> Save</Button>
                                            <Button type="button" variant="outline" onClick={() => { setShowAssignmentForm(false); setEditingAssignment(null); }} className="flex-1 border-white/10 hover:bg-white/5">Cancel</Button>
                                        </div>
                                    </form>
                                </FormCard>
                            )}
                        </AnimatePresence>

                        {assignments.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4"><FileText className="w-10 h-10 text-orange-400" /></div>
                                <p className="text-muted-foreground">No assignments yet</p>
                            </div>
                        ) : (
                            assignments.map((a, index) => (
                                <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02 }}>
                                    <Card className="border-0 bg-secondary/30 backdrop-blur-sm shadow-lg ring-1 ring-white/10 overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-600" />
                                        <CardContent className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-lg">{a.title}</p>
                                                <p className="text-sm text-muted-foreground">{a.courseName}</p>
                                                <p className="text-sm text-muted-foreground/70">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" onClick={() => { setEditingAssignment(a); setShowAssignmentForm(true); }} className="h-9 w-9 p-0 border-white/10 hover:bg-orange-500/20 hover:border-orange-500/30"><Edit className="w-4 h-4" /></Button>
                                                <Button size="sm" variant="outline" onClick={() => deleteAssignment(a.id)} className="h-9 w-9 p-0 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </TabsContent>

                    {/* Announcements Tab */}
                    <TabsContent value="announcements" className="space-y-4 mt-6">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => { setEditingAnnouncement(null); setShowAnnouncementForm(true); }} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-500/25 border-0">
                                <Plus className="mr-2 h-4 w-4" /> Add Announcement
                            </Button>
                        </motion.div>

                        <AnimatePresence>
                            {showAnnouncementForm && (
                                <FormCard title={editingAnnouncement ? 'Edit Announcement' : 'New Announcement'} onClose={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null); }} gradient="from-pink-500/10 to-rose-500/10">
                                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveAnnouncement({ content: fd.get('content') as string, courseId: fd.get('courseId') ? parseInt(fd.get('courseId') as string) : null }); }} className="space-y-3">
                                        <textarea name="content" placeholder="Announcement content" defaultValue={editingAnnouncement?.content || ''} required rows={4} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all outline-none resize-none" />
                                        <select name="courseId" defaultValue={editingAnnouncement?.courseId || ''} className="w-full p-3 bg-background/50 backdrop-blur-sm border border-white/10 rounded-lg focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all outline-none">
                                            <option value="">General (not course-specific)</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <div className="flex gap-2 pt-2">
                                            <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border-0"><Check className="mr-2 h-4 w-4" /> Save</Button>
                                            <Button type="button" variant="outline" onClick={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null); }} className="flex-1 border-white/10 hover:bg-white/5">Cancel</Button>
                                        </div>
                                    </form>
                                </FormCard>
                            )}
                        </AnimatePresence>

                        {announcements.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4"><Megaphone className="w-10 h-10 text-pink-400" /></div>
                                <p className="text-muted-foreground">No announcements yet</p>
                            </div>
                        ) : (
                            announcements.map((a, index) => (
                                <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.02 }}>
                                    <Card className="border-0 bg-secondary/30 backdrop-blur-sm shadow-lg ring-1 ring-white/10 overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-rose-600" />
                                        <CardContent className="p-4 flex justify-between items-start">
                                            <p className="flex-1 leading-relaxed">{a.content}</p>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                <Button size="sm" variant="outline" onClick={() => { setEditingAnnouncement(a); setShowAnnouncementForm(true); }} className="h-9 w-9 p-0 border-white/10 hover:bg-pink-500/20 hover:border-pink-500/30"><Edit className="w-4 h-4" /></Button>
                                                <Button size="sm" variant="outline" onClick={() => deleteAnnouncement(a.id)} className="h-9 w-9 p-0 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}
