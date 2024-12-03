/* eslint-disable jsx-a11y/alt-text */
import { useState, useEffect, useRef } from 'react';
import styles from './DiscordImage.module.scss';

export default function DiscordImage({ pushedImage, setPushedImage, setCurrentAudio }) {
  const [postid, setPostid] = useState(null);
  const [isTenor, setIsTenor] = useState(false);
  const parentAside = useRef(null);

  const [caption, setCaption] = useState(null);

  useEffect(() => {
    if (!pushedImage) {
      return;
    }

    /* console.log("!!!pushed image: ");
        console.log(pushedImage); */
    const script = document.createElement('script');

    if (pushedImage?.url?.includes('tenor')) {
      //get the last part of url after the last -
      setPostid(pushedImage.url.split('-').pop());
      setIsTenor(true);

      script.src = 'https://tenor.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      setIsTenor(false);
    }

    const captionMarkUp = (
      <>
        <span>{pushedImage.pusher}</span> pushed this image posted by <span>{pushedImage.author}</span> in{' '}
        <span>{pushedImage.channel}</span>
      </>
    );
    setCaption(captionMarkUp);

    console.log('setting audio to shutter');
    setCurrentAudio('shutter');
    // eslint-disable-next-line no-unused-vars
    const timer = setTimeout(() => {
      console.log('clearing pushed image');
      setPushedImage(null);
    }, 18000);
    /* if (isTenor) {
            return () => {
                if (isTenor) {
                    document.body.removeChild(script);
                }
            }
        } */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushedImage]);

  const checkDimensions = (e) => {
    if (e.target.width > e.target.height) {
      console.log('wide image');
      parentAside.current.classList.add(styles.wide);
    }
  };

  return (
    <div className={styles.DiscordImage}>
      {pushedImage && (
        <aside ref={parentAside} className={`${styles.imageAside} ${isTenor ? styles.tenor : null}`}>
          {/* <img src="https://cdn.dribbble.com/users/185738/screenshots/2751203/cowboy.gif" className={styles.theImage} /> */}
          {!isTenor && <img src={pushedImage.url} className={styles.pushedImage} onLoad={checkDimensions} />}
          {isTenor && (
            <div className='tenor-gif-embed' data-postid={postid} data-share-method='host' data-width='120%'>
              <a href={pushedImage.url}>Loading Image From tenor</a>
            </div>
          )}
          <div className={styles.titleCard}>
            <p className={`${styles.caption} windlass`}>{caption}</p>
            <img src='/images/tbanner.png' className={styles.imageBanner} />
          </div>
        </aside>
      )}
    </div>
  );
}
