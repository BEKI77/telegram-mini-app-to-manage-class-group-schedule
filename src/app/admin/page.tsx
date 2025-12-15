import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCourse, createSchedule, createAssignment, createAnnouncement, getCourses } from "@/actions/admin"

export default async function AdminPage() {
    const coursesList = await getCourses();

    return (
        <div className="container mx-auto pb-20 px-4 pt-4">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your class schedule and assignments.</p>
            </header>

            <Tabs defaultValue="courses" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="assignments">Hwork</TabsTrigger>
                    <TabsTrigger value="announcements">News</TabsTrigger>
                </TabsList>

                <TabsContent value="courses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Course</CardTitle>
                            <CardDescription>Create a new course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData) => {
                                'use server';
                                await createCourse({
                                    name: formData.get('name') as string,
                                    code: formData.get('code') as string,
                                    instructor: formData.get('instructor') as string,
                                });
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Course Name</Label>
                                    <Input id="name" name="name" placeholder="Intro to Physics" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Course Code</Label>
                                    <Input id="code" name="code" placeholder="PHY101" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instructor">Instructor</Label>
                                    <Input id="instructor" name="instructor" placeholder="Dr. Newton" required />
                                </div>
                                <Button type="submit" className="w-full">Create Course</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Schedule</CardTitle>
                            <CardDescription>Add a class timing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData) => {
                                'use server';
                                await createSchedule({
                                    courseId: parseInt(formData.get('courseId') as string),
                                    dayOfWeek: parseInt(formData.get('dayOfWeek') as string),
                                    startTime: formData.get('startTime') as string,
                                    endTime: formData.get('endTime') as string,
                                    location: formData.get('location') as string,
                                });
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="courseId">Course</Label>
                                    <select name="courseId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        {coursesList.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dayOfWeek">Day</Label>
                                        <select name="dayOfWeek" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                            <option value="1">Monday</option>
                                            <option value="2">Tuesday</option>
                                            <option value="3">Wednesday</option>
                                            <option value="4">Thursday</option>
                                            <option value="5">Friday</option>
                                            <option value="6">Saturday</option>
                                            <option value="0">Sunday</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" name="location" placeholder="Room 101" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime">Start Time</Label>
                                        <Input id="startTime" name="startTime" type="time" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endTime">End Time</Label>
                                        <Input id="endTime" name="endTime" type="time" required />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">Add Schedule</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Assignment</CardTitle>
                            <CardDescription>Create a new assignment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData) => {
                                'use server';
                                await createAssignment({
                                    courseId: parseInt(formData.get('courseId') as string),
                                    title: formData.get('title') as string,
                                    resultDate: new Date(formData.get('dueDate') as string),
                                });
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="courseId-assign">Course</Label>
                                    <select name="courseId" id="courseId-assign" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        {coursesList.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" placeholder="Assignment Title" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input id="dueDate" name="dueDate" type="datetime-local" required />
                                </div>
                                <Button type="submit" className="w-full">Create Assignment</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="announcements">
                    <Card>
                        <CardHeader>
                            <CardTitle>Post Announcement</CardTitle>
                            <CardDescription>Send an update to the class.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData) => {
                                'use server';
                                await createAnnouncement({
                                    title: formData.get('title') as string,
                                    content: formData.get('content') as string
                                });
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" placeholder="Announcement Title" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Announcement HTML/Text</Label>
                                    <Input id="content" name="content" placeholder="Class is cancelled tomorrow." required />
                                </div>
                                <Button type="submit" className="w-full">Post Announcement</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
