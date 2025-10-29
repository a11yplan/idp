import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
import * as styles from './styles';

export interface ConfirmationEmailProps {
  locale: 'en' | 'de';
  confirmationUrl: string;
}

const content = {
  en: {
    preview: 'Confirm your email address',
    heading: 'Confirm Email',
    body: 'Thanks for signing up! Please confirm your email by clicking the button below.',
    button: 'Confirm',
    footer: "If you didn't sign up, you can ignore this email.",
    fallbackLabel: "If the button doesn't work:",
  },
  de: {
    preview: 'E-Mail-Adresse bestätigen',
    heading: 'E-Mail bestätigen',
    body: 'Danke für deine Anmeldung! Bitte klick auf den Button, um deine E-Mail-Adresse zu bestätigen.',
    button: 'Bestätigen',
    footer: 'Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.',
    fallbackLabel: 'Falls der Button nicht funktioniert:',
  },
};

export const ConfirmationEmail = ({
  locale = 'en',
  confirmationUrl,
}: ConfirmationEmailProps) => {
  const t = content[locale];

  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      <Heading style={styles.h1}>{t.heading}</Heading>

      <Text style={styles.text}>{t.body}</Text>

      <EmailButton href={confirmationUrl}>
        {t.button}
      </EmailButton>

      <Text style={styles.text}>{t.footer}</Text>

      <Text style={styles.smallText}>{t.fallbackLabel}</Text>

      <Text style={styles.codeBlock}>{confirmationUrl}</Text>
    </EmailLayout>
  );
};

ConfirmationEmail.PreviewProps = {
  locale: 'en',
  confirmationUrl: 'https://a11yplan.de/confirm?token=abc123xyz789',
} as ConfirmationEmailProps;

export default ConfirmationEmail;
