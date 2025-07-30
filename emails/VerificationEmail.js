
// emails/VerificationEmail.js
export default function VerificationEmail({ name, otp }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2>Hello {name},</h2>
      <p>Thank you for signing up on Cafe Order System!</p>
      <p>Your verification code is:</p>
      <h1>{otp}</h1>
      <p>This code will expire in 1 hour.</p>
    </div>
  );
}

