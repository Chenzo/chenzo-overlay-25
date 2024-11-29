import './globals.scss';

export const metadata = {
  title: `Chenzo's Streaming Overlay '25`,
  description: `Chenzo's Streaming Overlay '25`,
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
