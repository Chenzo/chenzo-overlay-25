/* eslint-disable jsx-a11y/alt-text */
'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Header.module.scss';

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

export default function Header({ alignment }) {
  const skull = useRef();
  const [alignClass, setAlignClass] = useState(null);

  useEffect(() => {
    let val = parseInt(alignment) - 50;
    val = val * 9; //this is to go from -450% to 450% which is the width of the bar.;

    skull.current.style.transform = `translateX(${val}%)`;

    if (val < -200) {
      setAlignClass(styles.evilness);
    } else if (val > 200) {
      setAlignClass(styles.goodness);
    } else {
      setAlignClass(null);
    }
  }, [alignment]);

  return (
    <header className={`${styles.chenzHeader}  ${alignClass}`}>
      <div className={`${styles.innerBar} ${styles.top_clip} windlass`}>
        <span className='dropshadow_effect_11x tshadow'>
          The Gentlemen of Fortune and the Adventures of The Holy Bartender
        </span>
        <video width='1200' autoPlay={true} muted={true} loop={true}>
          <source src={`${BUCKET_URL}/video/waterup.webm`} type='video/webm' />
        </video>
      </div>
      <div className={styles.alignment}>
        <img src='images/ribbon_evil.png' className={styles.evil} />
        <img src='images/ribbon_good.png' className={styles.good} />
        <img id='skullmeter' src='images/skull_meter.png' ref={skull} className={styles.skullmeter} />
      </div>
    </header>
  );
}
