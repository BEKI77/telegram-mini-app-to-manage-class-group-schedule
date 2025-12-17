import { pgTable, serial, text, timestamp, integer, boolean, pgEnum, time, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'student', 'representative']);
export const assignmentStatusEnum = pgEnum('assignment_status', ['upcoming', 'overdue', 'completed']);

// Tables
export const users = pgTable('users', {
  telegramId: text('telegram_id').primaryKey(), // Telegram User ID
  firstName: text('first_name').notNull(),
  username: text('username'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const groups = pgTable('groups', {
  telegramId: text('telegram_id').primaryKey(), // Telegram Chat ID
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const topics = pgTable('topics', {
  id: text('id').primaryKey(),
  telegramId: text('telegram_id').notNull(), // The Thread ID
  groupId: text('group_id').references(() => groups.telegramId).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.telegramId).notNull(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  role: roleEnum('role').default('student'),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  name: text('name').notNull(),
  code: text('code'),
  instructor: text('instructor'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 or 1-7
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  location: text('location'),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  attachmentUrl: text('attachment_url'),
  status: assignmentStatusEnum('status').default('upcoming'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const programPeriods = pgTable('program_periods', {
  id: serial('id').primaryKey(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  name: text('name').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  description: text('description'),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const academicCalendars = pgTable('academic_calendars', {
  id: serial('id').primaryKey(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  url: text('url').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const topicsRelations = relations(topics, ({ one, many }) => ({
  group: one(groups, {
    fields: [topics.groupId],
    references: [groups.telegramId],
  }),
  courses: many(courses),
  roles: many(userRoles),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  topic: one(topics, {
    fields: [courses.topicId],
    references: [topics.id],
  }),
  schedules: many(schedules),
  assignments: many(assignments),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  course: one(courses, {
    fields: [schedules.courseId],
    references: [courses.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
}));
