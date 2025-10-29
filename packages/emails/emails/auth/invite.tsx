import { Heading, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailButton } from './components/EmailButton';
import * as styles from './styles';

export interface InviteEmailProps {
  locale: 'en' | 'de';
  inviteUrl: string;
  teamName: string;
}

const content = {
  en: {
    preview: "You've been invited to join a team",
    heading: "You've Been Invited",
    body: (teamName: string) =>
      `You've been invited to join the <strong>${teamName}</strong> team. Click the button below to accept the invitation.`,
    button: 'Accept Invitation',
    footer: "If you didn't expect this invitation, you can ignore this email.",
    fallbackLabel: "If the button doesn't work, copy and paste this link:",
  },
  de: {
    preview: 'Du wurdest zu einem Team eingeladen',
    heading: 'Du wurdest eingeladen',
    body: (teamName: string) =>
      `Du wurdest eingeladen, dem Team <strong>${teamName}</strong> beizutreten. Klick auf den Button, um die Einladung anzunehmen.`,
    button: 'Einladung annehmen',
    footer: 'Falls du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.',
    fallbackLabel: 'Falls der Button nicht funktioniert, kopiere diesen Link:',
  },
};

export const InviteEmail = ({
  locale = 'en',
  inviteUrl,
  teamName,
}: InviteEmailProps) => {
  const t = content[locale];

  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      <Heading style={styles.h1}>{t.heading}</Heading>

      <Text style={styles.text} dangerouslySetInnerHTML={{ __html: t.body(teamName) }} />

      <EmailButton href={inviteUrl}>
        {t.button}
      </EmailButton>

      <Text style={styles.text}>{t.footer}</Text>

      <Text style={styles.smallText}>{t.fallbackLabel}</Text>

      <Text style={styles.codeBlock}>{inviteUrl}</Text>
    </EmailLayout>
  );
};

InviteEmail.PreviewProps = {
  locale: 'en',
  inviteUrl: 'https://a11yplan.de/accept-invitation/abc123xyz789',
  teamName: 'A11YPLAN Team',
} as InviteEmailProps;

export default InviteEmail;
