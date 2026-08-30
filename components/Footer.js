'use client';

import chatStyles from './ChatRelay.module.scss';
import styles from './Footer.module.scss';

export default function Footer({ followers, subs, showingSubs, isChatting, chatMessage }) {
  return (
    <footer className={styles.chenzo_footer}>
      <ul className={`${styles.followers} ${isChatting || showingSubs ? styles.hide : ''}`}>
        <li>Recent Follows... </li>
        {followers.map((follower, idx) => {
          if (idx > 4) return;
          return <li key={`flr_${idx}`}>{follower.user_name}</li>;
        })}
      </ul>

      <ul className={`${styles.subs} ${isChatting || !showingSubs ? styles.hide : ''}`}>
        <li>Recent Subs... </li>
        {subs.map((sub, idx) => {
          if (idx > 4 || sub.user_name == 'Chenzorama') return;
          return <li key={`sub_${idx}`}>{sub.user_name}</li>;
        })}
      </ul>
      <section className={chatStyles.chatSpace}>{chatMessage}</section>
    </footer>
  );
}
