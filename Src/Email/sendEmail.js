import nodemailer from "nodemailer";
export const sendEmail = async (to, subject = "Email Verification", code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const html = `
    <div> 
      <h2>Verify Your Email</h2>
      <p>Your code is: <b>${code}</b></p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"Hiiii" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });

  console.log("✅ Email sent: " + info.messageId);
  return { success: true };
};
