import { CSSProperties } from 'react';

// Brand Colors
export const colors = {
  brand: '#3A77FF',
  brandHover: '#2a67ef',
  background: '#f5f5f5',
  white: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#ababab',
  codeBackground: '#f5f5f5',
} as const;

// Typography
export const fontFamily = "'Montserrat', 'Segoe UI', 'Arial', sans-serif";

// Main layout styles
export const main: CSSProperties = {
  backgroundColor: colors.background,
  margin: '0',
  padding: '0',
  fontFamily,
};

export const container: CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
};

export const emailContainer: CSSProperties = {
  backgroundColor: colors.white,
  padding: '40px 40px 20px 40px',
  borderRadius: '4px',
};

// Header styles
export const headerContainer: CSSProperties = {
  padding: '40px 0',
  textAlign: 'center',
};

export const logo: CSSProperties = {
  display: 'block',
  margin: '0 auto',
};

// Typography styles
export const h1: CSSProperties = {
  margin: '0 0 20px 0',
  fontFamily,
  fontSize: '24px',
  lineHeight: '30px',
  color: colors.textPrimary,
  fontWeight: '700',
};

export const text: CSSProperties = {
  margin: '0 0 20px 0',
  fontFamily,
  fontSize: '16px',
  lineHeight: '24px',
  color: colors.textPrimary,
};

export const smallText: CSSProperties = {
  margin: '20px 0 10px 0',
  fontFamily,
  fontSize: '14px',
  lineHeight: '20px',
  color: colors.textSecondary,
};

export const codeBlock: CSSProperties = {
  margin: '0 0 20px 0',
  fontFamily,
  fontSize: '14px',
  lineHeight: '20px',
  color: colors.textSecondary,
  wordBreak: 'break-all',
  backgroundColor: colors.codeBackground,
  padding: '10px',
  borderRadius: '4px',
};

// Button styles
export const buttonContainer: CSSProperties = {
  textAlign: 'center',
  margin: '20px 0',
};

export const button: CSSProperties = {
  backgroundColor: colors.brand,
  border: `1px solid ${colors.brand}`,
  borderRadius: '4px',
  color: colors.white,
  display: 'inline-block',
  fontFamily,
  fontSize: '16px',
  fontWeight: '700',
  lineHeight: 'normal',
  textAlign: 'center',
  textDecoration: 'none',
  padding: '10px 25px',
  minWidth: '200px',
};

// OTP Code styles
export const otpContainer: CSSProperties = {
  margin: '20px 0',
  textAlign: 'center',
};

export const otpLabel: CSSProperties = {
  margin: '0 0 10px 0',
  fontFamily,
  fontSize: '14px',
  lineHeight: '20px',
  color: colors.textSecondary,
};

export const otpCode: CSSProperties = {
  margin: '0',
  fontFamily,
  fontSize: '24px',
  lineHeight: '30px',
  color: colors.textPrimary,
  fontWeight: '700',
  letterSpacing: '3px',
};

// Footer styles
export const footer: CSSProperties = {
  padding: '40px 0',
  textAlign: 'center',
  color: colors.textSecondary,
  fontSize: '12px',
};

export const footerText: CSSProperties = {
  margin: '0',
};

export const footerAddress: CSSProperties = {
  margin: '10px 0 0 0',
};
