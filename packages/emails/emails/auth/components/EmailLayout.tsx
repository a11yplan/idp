import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
} from '@react-email/components';
import { ReactNode } from 'react';
import * as styles from '../styles';

export interface EmailLayoutProps {
  children: ReactNode;
  previewText: string;
  locale: 'en' | 'de';
}

export const EmailLayout = ({ children, previewText, locale }: EmailLayoutProps) => {
  return (
    <Html lang={locale} dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Header with Logo */}
          <Section style={styles.headerContainer}>
            <Img
              src="https://a11yplan.de/a11yplan.svg"
              width="180"
              height="auto"
              alt="a11yplan Logo"
              style={styles.logo}
            />
          </Section>

          {/* Email Content */}
          <Section style={styles.emailContainer}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 A11YPLAN GmbH. All rights reserved.
            </Text>
            <Text style={styles.footerAddress}>
              Hartlaubstraße 3, 74541 Vellberg, Deutschland
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
