const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      // Create transporter - FIXED METHOD NAME
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }

  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, 'emailTemplates', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      return handlebars.compile(templateContent);
    } catch (error) {
      console.error(`❌ Failed to load email template ${templateName}:`, error.message);
      throw error;
    }
  }

  async loadBaseTemplate() {
    try {
      const basePath = path.join(__dirname, 'emailTemplates', 'base.hbs');
      const baseContent = await fs.readFile(basePath, 'utf8');
      return handlebars.compile(baseContent);
    } catch (error) {
      console.error('❌ Failed to load base email template:', error.message);
      throw error;
    }
  }

  async sendEmail({ to, subject, templateName, templateData }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // Load templates
      const contentTemplate = await this.loadTemplate(templateName);
      const baseTemplate = await this.loadBaseTemplate();

      // Compile content
      const content = contentTemplate(templateData);

      // Compile final email with base template
      const finalHtml = baseTemplate({
        subject,
        fromName: process.env.EMAIL_FROM_NAME,
        content
      });

      // Send email
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html: finalHtml
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Application received confirmation
  async sendApplicationReceived(studentData, jobData, applicationData) {
    return await this.sendEmail({
      to: studentData.email,
      subject: `Application Received: ${jobData.title}`,
      templateName: 'applicationReceived',
      templateData: {
        studentName: studentData.name,
        jobTitle: jobData.title,
        companyName: jobData.company,
        jobLocation: jobData.location,
        applicationDate: new Date(applicationData.appliedAt).toLocaleDateString(),
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/applications`
      }
    });
  }

  // New application alert to recruiter
  async sendNewApplicationAlert(recruiterData, studentData, jobData, applicationData) {
    return await this.sendEmail({
      to: recruiterData.email,
      subject: `New Application: ${jobData.title}`,
      templateName: 'newApplicationAlert',
      templateData: {
        recruiterName: recruiterData.name,
        applicantName: studentData.name,
        applicantEmail: studentData.email,
        jobTitle: jobData.title,
        applicationDate: new Date(applicationData.appliedAt).toLocaleDateString(),
        coverLetter: applicationData.coverLetter || 'No cover letter provided',
        resumeUrl: applicationData.resumeUrl,
        applicationsUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/recruiter/applications`
      }
    });
  }

  // Application status update
  async sendStatusUpdate(studentData, jobData, applicationData, newStatus, recruiterNotes) {
    const statusColors = {
      pending: '#ffc107',
      reviewing: '#17a2b8',
      shortlisted: '#28a745',
      interviewed: '#6f42c1',
      selected: '#28a745',
      rejected: '#dc3545'
    };

    const nextStepsMap = {
      reviewing: 'We are currently reviewing your application.',
      shortlisted: 'Congratulations! You have been shortlisted. We will contact you soon for the next steps.',
      interviewed: 'Great job! We will be in touch with the final decision soon.',
      selected: 'Congratulations! You have been selected. Our team will contact you with next steps.',
      rejected: 'Thank you for your interest. We encourage you to apply for other positions that match your skills.'
    };

    return await this.sendEmail({
      to: studentData.email,
      subject: `Application Update: ${jobData.title}`,
      templateName: 'statusUpdate',
      templateData: {
        studentName: studentData.name,
        jobTitle: jobData.title,
        companyName: jobData.company,
        newStatus: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
        statusColor: statusColors[newStatus] || '#6c757d',
        recruiterNotes,
        nextSteps: nextStepsMap[newStatus],
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/applications`
      }
    });
  }
}

// Export singleton instance
module.exports = new EmailService();
