// Simple email system with console logging and sharing options

export interface EmailInvitation {
  to: string;
  listingTitle: string;
  listingPrice: number;
  listingDescription: string;
  sellerName: string;
  listingUrl: string;
}

export async function sendInvitationEmail(invitation: EmailInvitation): Promise<boolean> {
  // For now, create a comprehensive email preview that works immediately
  const emailContent = {
    to: invitation.to,
    subject: `You're invited to view: ${invitation.listingTitle}`,
    preview: `${invitation.sellerName} has invited you to view their private listing`,
    body: `
📧 EMAIL INVITATION CREATED
════════════════════════════════════════

To: ${invitation.to}
From: ${invitation.sellerName}
Subject: You're invited to view: ${invitation.listingTitle}

${invitation.sellerName} has invited you to view their private listing:

${invitation.listingTitle}
Price: $${invitation.listingPrice.toFixed(2)}

${invitation.listingDescription}

🔗 Share this link: ${invitation.listingUrl}

This is a private invitation - please don't share with others.

════════════════════════════════════════
    `.trim()
  };

  // Log the complete email for manual sharing
  console.log(emailContent.body);
  
  // Create a shareable version
  const shareMessage = `Hi! ${invitation.sellerName} invited you to view their listing "${invitation.listingTitle}" for $${invitation.listingPrice.toFixed(2)}. Check it out: ${invitation.listingUrl}`;
  
  console.log('\n💬 SHAREABLE MESSAGE:');
  console.log(shareMessage);
  console.log('\n📱 You can copy/paste this message to send via text, email, or social media.\n');

  return true; // Always successful for logging
}

export async function sendMultipleInvitations(invitations: EmailInvitation[]): Promise<{ sent: number; failed: number }> {
  console.log(`\n📬 SENDING ${invitations.length} EMAIL INVITATIONS:`);
  console.log('═'.repeat(50));
  
  for (const invitation of invitations) {
    await sendInvitationEmail(invitation);
    console.log('─'.repeat(50));
  }
  
  return { sent: invitations.length, failed: 0 };
}