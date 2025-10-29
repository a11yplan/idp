import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
import * as styles from './styles';

export interface ResetPasswordEmailProps {
  locale: 'en' | 'de';
  siteUrl: string;
  tokenHash: string;
  redirectTo?: string;
}

const content = {
  en: {
    preview: 'Reset your password',
    heading: 'Reset Password',
    body: 'Click the button below to reset your password.',
    button: 'Reset',
    footer: "If you didn't request this reset, you can ignore this email.",
    fallbackLabel: "If the button doesn't work:",
  },
  de: {
    preview: 'Passwort zurücksetzen',
    heading: 'Passwort zurücksetzen',
    body: 'Klick auf den Button, um dein Passwort zurückzusetzen.',
    button: 'Zurücksetzen',
    footer: 'Falls du kein Zurücksetzen angefordert hast, kannst du diese E-Mail ignorieren.',
    fallbackLabel: 'Falls der Button nicht funktioniert:',
  },
};

export const ResetPasswordEmail = ({
  locale = 'en',
  siteUrl,
  tokenHash,
  redirectTo = '',
}: ResetPasswordEmailProps) => {
  const t = content[locale];
  const resetUrl = `${siteUrl}/auth/login?provider=email&type=recovery&token=${tokenHash}&redirect_to=${redirectTo}`;

  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      <Heading style={styles.h1}>{t.heading}</Heading>

      <Text style={styles.text}>{t.body}</Text>

      <EmailButton href={resetUrl}>
        {t.button}
      </EmailButton>

      <Text style={styles.text}>{t.footer}</Text>

      <Text style={styles.smallText}>{t.fallbackLabel}</Text>

      <Text style={styles.codeBlock}>{resetUrl}</Text>
    </EmailLayout>
  );
};

ResetPasswordEmail.PreviewProps = {
  locale: 'en',
  siteUrl: 'https://a11yplan.de',
  tokenHash: 'abc123xyz789hash',
  redirectTo: '/dashboard',
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;
