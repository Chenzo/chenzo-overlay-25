import '../globals.scss';
import styles from './layout.module.scss';

export const metadata = {
  title: "Chenzo's Overlay Soundboard",
  description: "Chenzo's Overlay Soundboard",
  openGraph: {
    title: "Chenzo's Overlay Soundboard",
    description: "Chenzo's Overlay Soundboard",
    type: 'website',
    images: [
      {
        url: '/images/hand_icon_forsub.png',
        width: 1200,
        height: 630,
        alt: "Chenzo's Overlay Soundboard",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Chenzo's Overlay Soundboard",
    description: "Chenzo's Overlay Soundboard",
    images: ['/images/hand_icon_forsub.png'],
  },
};

export default function SounderLayout({ children }) {
  return <div className={styles.standalone}>{children}</div>;
}
