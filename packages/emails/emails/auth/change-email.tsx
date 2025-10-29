import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
import * as styles from './styles';

export interface ChangeEmailEmailProps {
  locale: 'en' | 'de';
  siteUrl: string;
  tokenHash: string;
  redirectTo?: string;
}

const content = {
  en: {
    preview: 'Confirm your email change',
    heading: 'Change Email',
    body: 'Please click the button below to confirm your email change.',
    button: 'Confirm',
    footer: "If you didn't request this email change, you can ignore this email or contact us.",
    fallbackLabel: "If the button doesn't work, copy this text:",
  },
  de: {
    preview: 'E-Mail-Änderung bestätigen',
    heading: 'E-Mail-Adresse ändern',
    body: 'Bitte klick auf den Button, um die Änderung deiner E-Mail-Adresse zu bestätigen.',
    button: 'Bestätigen',
    footer: 'Falls du diese Änderung nicht angefordert hast, ignoriere diese E-Mail oder kontaktiere uns.',
    fallbackLabel: 'Falls der Button nicht funktioniert:',
  },
};

export const ChangeEmailEmail = ({
  locale = 'en',
  siteUrl,
  tokenHash,
  redirectTo = '',
}: ChangeEmailEmailProps) => {
  const t = content[locale];
  const changeUrl = `${siteUrl}/auth/login?provider=email&type=email_change&token=${tokenHash}&redirect_to=${redirectTo}`;

  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      <Heading style={styles.h1}>{t.heading}</Heading>

      <Text style={styles.text}>{t.body}</Text>

      <EmailButton href={changeUrl}>
        {t.button}
      </EmailButton>

      <Text style={styles.text}>{t.footer}</Text>

      <Text style={styles.smallText}>{t.fallbackLabel}</Text>

      <Text style={styles.codeBlock}>{changeUrl}</Text>
    </EmailLayout>
  );
};

ChangeEmailEmail.PreviewProps = {
  locale: 'en',
  siteUrl: 'https://a11yplan.de',
  tokenHash: 'abc123xyz789hash',
  redirectTo: '/profile',
} as ChangeEmailEmailProps;

export default ChangeEmailEmail;
