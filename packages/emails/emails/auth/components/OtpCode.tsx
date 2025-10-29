import { Section, Text } from '@react-email/components';
import * as styles from '../styles';

export interface OtpCodeProps {
  code: string;
  label: string;
}

export const OtpCode = ({ code, label }: OtpCodeProps) => {
  return (
    <Section style={styles.otpContainer}>
      <Text style={styles.otpLabel}>{label}</Text>
      <Text style={styles.otpCode}>{code}</Text>
    </Section>
  );
};
