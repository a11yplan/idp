import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
import { OtpCode } from './components/OtpCode';
import * as styles from './styles';

export interface MagicLinkEmailProps {
  locale: 'en' | 'de';
  siteUrl: string;
  tokenHash: string;
  token: string;
}

const content = {
  en: {
    preview: 'Your login link',
    heading: 'Your Login Link',
    body: 'Click the button below to sign in. This link expires in 24 hours.',
    button: 'Sign In',
    otpLabel: 'Or use this code:',
    footer: "If you didn't request this login, you can ignore this email.",
    fallbackLabel: "If the button doesn't work:",
  },
  de: {
    preview: 'Dein Login-Link',
    heading: 'Dein Login-Link',
    body: 'Klick auf den Button, um dich anzumelden. Der Link ist 24 Stunden gültig.',
    button: 'Anmelden',
    otpLabel: 'Alternativ diesen Code verwenden:',
    footer: 'Falls du keine Anmeldung angefordert hast, kannst du diese E-Mail ignorieren.',
    fallbackLabel: 'Falls der Button nicht funktioniert:',
  },
};

export const MagicLinkEmail = ({
  locale = 'en',
  siteUrl,
  tokenHash,
  token,
}: MagicLinkEmailProps) => {
  const t = content[locale];
  const loginUrl = `${siteUrl}/login?token=${tokenHash}`;

  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      <Heading style={styles.h1}>{t.heading}</Heading>

      <Text style={styles.text}>{t.body}</Text>

      <EmailButton href={loginUrl}>
        {t.button}
      </EmailButton>

      <OtpCode code={token} label={t.otpLabel} />

      <Text style={styles.text}>{t.footer}</Text>

      <Text style={styles.smallText}>{t.fallbackLabel}</Text>

      <Text style={styles.codeBlock}>{loginUrl}</Text>
    </EmailLayout>
  );
};

MagicLinkEmail.PreviewProps = {
  locale: 'en',
  siteUrl: 'https://a11yplan.de',
  tokenHash: 'abc123xyz789hash',
  token: 'SPARO-NDIGO-AMURT-SECAN',
} as MagicLinkEmailProps;

export default MagicLinkEmail;
