// Componente individual de notificación

'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    FileText,
    MessageSquare,
    Upload,
    AlertCircle,
    UserPlus,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notification-types';
import { markNotificationAsRead } from '@/lib/notifications';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
    notification: Notification;
}

const iconMap = {
    task_assigned: FileText,
    task_submitted: FileText,
    task_graded: CheckCircle2,
    message: MessageSquare,
    material_uploaded: Upload,
    report_created: AlertCircle,
    student_joined: UserPlus,
    announcement: MessageSquare,
};

const colorMap = {
    task_assigned: 'text-blue-600',
    task_submitted: 'text-green-600',
    task_graded: 'text-purple-600',
    message: 'text-cyan-600',
    material_uploaded: 'text-orange-600',
    report_created: 'text-red-600',
    student_joined: 'text-emerald-600',
    announcement: 'text-indigo-600',
};

export function NotificationItem({ notification }: NotificationItemProps) {
    const router = useRouter();
    const Icon = iconMap[notification.type];

    const handleClick = async () => {
        // Marcar como leída
        if (!notification.read) {
            await markNotificationAsRead(notification.id);
        }

        // Navegar según el tipo
        if (notification.classroomId) {
            router.push(`/aulas/${notification.classroomId}`);
        }
    };

    const timeAgo = notification.createdAt
        ? formatDistanceToNow(notification.createdAt.toDate(), {
            addSuffix: true,
            locale: es
        })
        : '';

    return (
        <div
            onClick={handleClick}
            className={cn(
                'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                !notification.read && 'bg-blue-50 dark:bg-blue-950/20'
            )}
        >
            <div className="flex gap-3">
                <div className={cn('mt-1', colorMap[notification.type])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {timeAgo}
                    </p>
                </div>
                {!notification.read && (
                    <div className="mt-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                )}
            </div>
        </div>
    );
}
