import './globals.scss';

export const metadata = {
  title: `Chenzo's Streaming Overlay '25`,
  description: `Chenzo's Streaming Overlay '25`,
  icons: {
    icon: [
      { url: '/favicon.ico', rel: 'icon', type: 'image/x-icon' },
      { url: '/favicon-56.png', sizes: '56x56', type: 'image/png' },
      { url: '/favicon-112.png', sizes: '112x112', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
