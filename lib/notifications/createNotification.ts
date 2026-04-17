import { NotificationType } from "@/types";
import { Prisma } from "@prisma/client";

type TCreateNotificationInput = {
  tx: Prisma.TransactionClient;
  userIds: string[];
  groupId: string;
  type: NotificationType;
  message: string;
};

export async function createNotifications({
  tx,
  userIds,
  groupId,
  type,
  message,
}: TCreateNotificationInput) {
  if (!userIds.length) return;

  await tx.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      groupId,
      type,
      message,
    })),
  });
}
