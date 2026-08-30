import Header from '../Header';
import Sunks from '../Sunks';
import DiscordImage from '../DiscordImage';
import Footer from '../Footer';
import AncientCoin from '../AncientCoin';
import TestCoinButton from '../TestCoinButton';

export default function SotTheme({
  alignment,
  showBartender,
  sunkShipArray,
  pushedImage,
  setPushedImage,
  setCurrentAudio,
  showCoin,
  onCoinHidden,
  onTestCoin,
  followers,
  subs,
  showingSubs,
  isChatting,
  chatMessage,
}) {
  return (
    <>
      {showBartender && <Header alignment={alignment} />}
      <Sunks sunkShipArray={sunkShipArray} />
      <DiscordImage pushedImage={pushedImage} setPushedImage={setPushedImage} setCurrentAudio={setCurrentAudio} />
      {showBartender && (
        <Footer
          followers={followers}
          subs={subs}
          showingSubs={showingSubs}
          isChatting={isChatting}
          chatMessage={chatMessage}
        />
      )}
      <AncientCoin showCoin={showCoin} onCoinHidden={onCoinHidden} />
      <TestCoinButton onTestCoin={onTestCoin} />
    </>
  );
}
