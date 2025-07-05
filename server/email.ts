import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailInvitation {
  to: string;
  listingTitle: string;
  listingPrice: number;
  listingDescription: string;
  sellerName: string;
  listingUrl: string;
}

export async function sendInvitationEmail(invitation: EmailInvitation): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY not configured');
    return false;
  }

  try {
    const msg = {
      to: invitation.to,
      from: 'noreply@replit.app', // Using verified Replit domain
      subject: `You're invited to view: ${invitation.listingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-bottom: 20px; text-align: center;">You've Been Invited!</h1>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              ${invitation.sellerName} has invited you to view their private listing:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0;">${invitation.listingTitle}</h2>
              <p style="color: #059669; font-size: 24px; font-weight: bold; margin: 10px 0;">$${invitation.listingPrice.toFixed(2)}</p>
              <p style="color: #6b7280; margin: 10px 0;">${invitation.listingDescription.substring(0, 200)}${invitation.listingDescription.length > 200 ? '...' : ''}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitation.listingUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Listing
              </a>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 30px;">
              This is a private invitation. Please don't share this link with others.
            </p>
          </div>
        </div>
      `,
      text: `
You've been invited by ${invitation.sellerName} to view their private listing:

${invitation.listingTitle}
Price: $${invitation.listingPrice.toFixed(2)}

${invitation.listingDescription}

View the listing here: ${invitation.listingUrl}

This is a private invitation. Please don't share this link with others.
      `
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendMultipleInvitations(invitations: EmailInvitation[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const invitation of invitations) {
    const success = await sendInvitationEmail(invitation);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { sent, failed };
}