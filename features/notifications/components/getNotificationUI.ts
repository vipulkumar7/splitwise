import { INotification } from "@/types";

export function getNotificationUI(n: INotification) {
  switch (n.type) {
    case "EXPENSE_ADDED":
      return {
        icon: "💸",
        color: "text-green-400",
      };

    case "EXPENSE_UPDATED":
      return {
        icon: "✏️",
        color: "text-yellow-400",
      };

    case "EXPENSE_DELETED":
      return {
        icon: "🗑️",
        color: "text-red-400",
      };

    case "USER_JOINED":
      return {
        icon: "👥",
        color: "text-blue-400",
      };

    case "GROUP_CREATED":
      return {
        icon: "✨",
        color: "text-purple-400",
      };

    default:
      return {
        icon: "🔔",
        color: "text-gray-400",
      };
  }
}
