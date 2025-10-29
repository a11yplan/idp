import { Button, Section } from '@react-email/components';
import * as styles from '../styles';

export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton = ({ href, children }: EmailButtonProps) => {
  return (
    <Section style={styles.buttonContainer}>
      <Button href={href} style={styles.button}>
        {children}
      </Button>
    </Section>
  );
};
