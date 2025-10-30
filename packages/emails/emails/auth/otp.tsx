import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { OtpCode } from './components/OtpCode';
import * as styles from './styles';

export interface OtpEmailProps {
  locale: 'en' | 'de';
  otp: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
}

const content = {
  en: {
    'sign-in': {
      preview: 'Your sign-in code',
      heading: 'Your Sign-In Code',
      body: 'Enter this code to sign in to your account. This code expires in 10 minutes.',
      otpLabel: 'Your verification code:',
      footer: "If you didn't request this code, you can ignore this email.",
    },
    'email-verification': {
      preview: 'Verify your email',
      heading: 'Verify Your Email',
      body: 'Enter this code to verify your email address. This code expires in 10 minutes.',
      otpLabel: 'Your verification code:',
      footer: "If you didn't request this verification, you can ignore this email.",
    },
    'forget-password': {
      preview: 'Reset your password',
      heading: 'Reset Your Password',
      body: 'Enter this code to reset your password. This code expires in 10 minutes.',
      otpLabel: 'Your reset code:',
      footer: "If you didn't request a password reset, you can ignore this email.",
    },
  },
  de: {
    'sign-in': {
      preview: 'Dein Anmelde-Code',
      heading: 'Dein Anmelde-Code',
      body: 'Gib diesen Code ein, um dich anzumelden. Der Code ist 10 Minuten gültig.',
      otpLabel: 'Dein Verifizierungscode:',
      footer: 'Falls du diesen Code nicht angefordert hast, kannst du diese E-Mail ignorieren.',
    },
    'email-verification': {
      preview: 'E-Mail verifizieren',
      heading: 'E-Mail-Adresse verifizieren',
      body: 'Gib diesen Code ein, um deine E-Mail-Adresse zu verifizieren. Der Code ist 10 Minuten gültig.',
      otpLabel: 'Dein Verifizierungscode:',
      footer: 'Falls du diese Verifizierung nicht angefordert hast, kannst du diese E-Mail ignorieren.',
    },
    'forget-password': {
      preview: 'Passwort zurücksetzen',
      heading: 'Passwort zurücksetzen',
      body: 'Gib diesen Code ein, um dein Passwort zurückzusetzen. Der Code ist 10 Minuten gültig.',
      otpLabel: 'Dein Zurücksetzungs-Code:',
      footer: 'Falls du keine Passwortzurücksetzung angefordert hast, kannst du diese E-Mail ignorieren.',
    },
  },
};

export const OtpEmail = ({
  locale = 'en',
  otp,
  type = 'sign-in',
}: OtpEmailProps) => {
  const t = content[locale][type];

  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      <Heading style={styles.h1}>{t.heading}</Heading>

      <Text style={styles.text}>{t.body}</Text>

      <OtpCode code={otp} label={t.otpLabel} />

      <Text style={styles.text}>{t.footer}</Text>
    </EmailLayout>
  );
};

OtpEmail.PreviewProps = {
  locale: 'en',
  otp: '123456',
  type: 'sign-in',
} as OtpEmailProps;

export default OtpEmail;
