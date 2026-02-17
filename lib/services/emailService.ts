/**
 * Service d'envoi d'emails
 * 
 * Pour l'instant, ce service simule l'envoi d'emails en les affichant dans la console.
 * En production, vous devrez configurer un vrai service d'email comme:
 * - Nodemailer avec Gmail/SMTP
 * - SendGrid
 * - Mailgun
 * - Firebase Extensions (Trigger Email)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envoie un email (simulation pour le développement)
 */
async function sendEmaill(options: EmailOptions): Promise<void> {
  console.log('📧 EMAIL ENVOYÉ:');
  console.log('À:', options.to);
  console.log('Sujet:', options.subject);
  console.log('Contenu:', options.html);
  console.log('---');
  
  // En production, remplacer par:
  // await transporter.sendMail(options);
  // ou
  // await sgMail.send(options);
}

/**
 * Template HTML pour email de vérification
 */
function getVerificationEmailTemplate(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .code-box {
          background: white;
          border: 2px dashed #f97316;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          border-radius: 8px;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #f97316;
          letter-spacing: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Vérification de votre compte</h1>
      </div>
      <div class="content">
        <p>Bonjour <strong>${name}</strong>,</p>
        
        <p>Merci de vous être inscrit sur notre plateforme ! Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
        
        <div class="code-box">
          <div class="code">${code}</div>
          <p style="margin: 10px 0 0 0; color: #6b7280;">Code de vérification</p>
        </div>
        
        <div class="warning">
          <strong>⏰ Important :</strong> Ce code expire dans <strong>4 minutes</strong>.
        </div>
        
        <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.</p>
        
        <p>Cordialement,<br>L'équipe de support</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template HTML pour email de bienvenue
 */
function getWelcomeEmailTemplate(name: string, role: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          background: #f97316;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Bienvenue !</h1>
      </div>
      <div class="content">
        <p>Bonjour <strong>${name}</strong>,</p>
        
        <p>Votre compte <strong>${role}</strong> a été vérifié avec succès ! Vous pouvez maintenant profiter de toutes les fonctionnalités de notre plateforme.</p>
        
        <p style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
            Accéder à mon dashboard
          </a>
        </p>
        
        <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.</p>
        
        <p>Cordialement,<br>L'équipe de support</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template HTML pour email d'approbation
 */
function getApprovalEmailTemplate(name: string, approved: boolean, reason?: string): string {
  const color = approved ? '#10b981' : '#ef4444';
  const title = approved ? '✅ Compte approuvé' : '❌ Compte rejeté';
  const message = approved 
    ? 'Votre compte a été approuvé par notre équipe ! Vous pouvez maintenant accéder à toutes les fonctionnalités.'
    : `Malheureusement, votre compte n'a pas été approuvé pour la raison suivante : ${reason || 'Non spécifiée'}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: ${color};
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          background: #f97316;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="content">
        <p>Bonjour <strong>${name}</strong>,</p>
        
        <p>${message}</p>
        
        ${approved ? `
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              Accéder à mon dashboard
            </a>
          </p>
        ` : `
          <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe de support.</p>
        `}
        
        <p>Cordialement,<br>L'équipe de support</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envoie un email de vérification avec le code
 */
export async function sendVerificationEmail(
  email: string, 
  code: string, 
  name: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: '🔐 Code de vérification de votre compte',
    html: getVerificationEmailTemplate(name, code)
  });
}

/**
 * Envoie un email de bienvenue
 */
export async function sendWelcomeEmail(
  email: string, 
  name: string,
  role: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: '🎉 Bienvenue sur notre plateforme !',
    html: getWelcomeEmailTemplate(name, role)
  });
}

/**
 * Envoie un email d'approbation ou de rejet
 */
export async function sendApprovalEmail(
  email: string, 
  name: string, 
  approved: boolean, 
  reason?: string
): Promise<void> {
  const subject = approved 
    ? '✅ Votre compte a été approuvé' 
    : '❌ Votre compte n\'a pas été approuvé';
  
  await sendEmail({
    to: email,
    subject,
    html: getApprovalEmailTemplate(name, approved, reason)
  });
}

/**
 * Envoie un email générique avec template personnalisé
 */
export async function sendEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>
): Promise<void> {
  // Pour l'instant, simulation
  console.log('📧 EMAIL ENVOYÉ:');
  console.log('À:', to);
  console.log('Sujet:', subject);
  console.log('Template:', template);
  console.log('Données:', data);
  console.log('---');
  
  // En production, utiliser un vrai service d'email
  // avec des templates personnalisés pour chaque type de notification
}

