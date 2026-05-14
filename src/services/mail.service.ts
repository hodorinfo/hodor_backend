import nodemailer from "nodemailer";

export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendContactEmail(data: {
    fullName: string;
    email: string;
    companyName?: string;
    serviceOfInterest: string;
    message: string;
  }) {
    const mailOptions = {
      from: `"${data.fullName}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: data.email,
      subject: `New Contact Request: ${data.serviceOfInterest}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Message from HodorInfo Contact Form</h2>
          <p><strong>Full Name:</strong> ${data.fullName}</p>
          <p><strong>Email Address:</strong> ${data.email}</p>
          <p><strong>Company Name:</strong> ${data.companyName || "N/A"}</p>
          <p><strong>Service of Interest:</strong> ${data.serviceOfInterest}</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p>${data.message}</p>
          </div>
          <footer style="margin-top: 30px; font-size: 0.8em; color: #777;">
            Sent from HodorInfo Career System Backend.
          </footer>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

export default new MailService();
