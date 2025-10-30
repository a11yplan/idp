import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
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
    body: 'Click the button below to sign in. This link expires in 1 hour.',
    button: 'Sign In',
    footer: "If you didn't request this login, you can ignore this email.",
    fallbackLabel: "If the button doesn't work, copy and paste this link:",
  },
  de: {
    preview: 'Dein Login-Link',
    heading: 'Dein Login-Link',
    body: 'Klick auf den Button, um dich anzumelden. Der Link ist 1 Stunde gültig.',
    button: 'Anmelden',
    footer: 'Falls du keine Anmeldung angefordert hast, kannst du diese E-Mail ignorieren.',
    fallbackLabel: 'Falls der Button nicht funktioniert, kopiere diesen Link:',
  },
};

export const MagicLinkEmail = ({
  locale = 'en',
  siteUrl,
  tokenHash,
  token,
}: MagicLinkEmailProps) => {
  const t = content[locale];
  const loginUrl = `${siteUrl}/api/auth/magic-link/verify?token=${tokenHash}&callbackURL=/`;

  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      <Heading style={styles.h1}>{t.heading}</Heading>

      <Text style={styles.text}>{t.body}</Text>

      <EmailButton href={loginUrl}>
        {t.button}
      </EmailButton>

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
