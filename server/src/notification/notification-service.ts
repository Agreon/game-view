import { Notification, User } from '@game-watch/database';
import { EntityRepository, QueryOrder,Ref } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
    public constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: EntityRepository<Notification>,
    ) { }

    public async getNotifications(user: Ref<User>): Promise<Notification[]> {
        return await this.notificationRepository.find(
            { read: false, user },
            {
                populate: ['game', 'infoSource'],
                orderBy: { createdAt: QueryOrder.DESC, id: QueryOrder.DESC },
            }
        );
    }

    public async markNotificationAsRead(id: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOneOrFail(id);

        notification.read = true;
        await this.notificationRepository.persistAndFlush(notification);

        return notification;
    }

    public async markAllNotificationsAsRead(user: Ref<User>): Promise<void> {
        const notifications = await this.notificationRepository.find({ read: false, user });

        for (const notification of notifications) {
            notification.read = true;
        }
        await this.notificationRepository.persistAndFlush(notifications);
    }
}
