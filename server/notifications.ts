// Simple notification system for email invitations
interface EmailInvitation {
  to: string;
  listingTitle: string;
  listingPrice: number;
  listingDescription: string;
  sellerName: string;
  listingUrl: string;
}

interface StoredNotification {
  id: string;
  email: string;
  subject: string;
  message: string;
  listingId: string;
  createdAt: Date;
  isRead: boolean;
}

// In-memory notification storage (will persist in database later)
const notifications: StoredNotification[] = [];

export function sendInvitationNotification(invitation: EmailInvitation): boolean {
  try {
    const notification: StoredNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: invitation.to,
      subject: `You're invited to view: ${invitation.listingTitle}`,
      message: `
${invitation.sellerName} has invited you to view their private listing:

${invitation.listingTitle}
Price: $${invitation.listingPrice.toFixed(2)}

${invitation.listingDescription}

View the listing here: ${invitation.listingUrl}

This is a private invitation. Please don't share this link with others.
      `.trim(),
      listingId: invitation.listingUrl.split('/').pop() || '',
      createdAt: new Date(),
      isRead: false
    };

    notifications.push(notification);
    
    // Log the notification for debugging
    console.log(`📧 Email invitation created for ${invitation.to}:`);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Message preview: ${notification.message.substring(0, 100)}...`);
    
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

export function sendMultipleInvitations(invitations: EmailInvitation[]): { sent: number; failed: number } {
  let sent = 0;
  let failed = 0;

  for (const invitation of invitations) {
    const success = sendInvitationNotification(invitation);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

export function getNotificationsForEmail(email: string): StoredNotification[] {
  return notifications.filter(n => n.email === email);
}

export function getAllNotifications(): StoredNotification[] {
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function markNotificationAsRead(id: string): boolean {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
    return true;
  }
  return false;
}