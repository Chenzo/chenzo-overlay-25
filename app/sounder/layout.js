import '../globals.scss';
import styles from './layout.module.scss';

export const metadata = {
  title: `Chenzo's Sound Board`,
  description: `Chenzo's Sound Board`,
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={styles.standalone}>
      <body>{children}</body>
    </html>
  );
}
