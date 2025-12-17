'use client';

import { Book, Calendar, ClipboardList, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const tabs = [
    { name: 'Today', href: '/', icon: Clock },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Work', href: '/assignments', icon: ClipboardList },
    { name: 'Courses', href: '/courses', icon: Book },
    { name: 'Academic', href: '/academic-calendar', icon: FileText },
];

export function BottomTabs() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]">
            <div className="bg-black/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/5 shadow-2xl h-16 px-1 flex justify-around items-center">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={clsx(
                                "relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute top-2 bottom-2 w-12 bg-white/10 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                />
                            )}

                            <div className="relative z-10 flex flex-col items-center gap-0.5">
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={clsx("transition-transform", isActive && "scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]")} />
                                <span className={clsx("text-[9px] font-medium tracking-wide", isActive ? "text-white opacity-100" : "opacity-0")}>
                                    {tab.name}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}
