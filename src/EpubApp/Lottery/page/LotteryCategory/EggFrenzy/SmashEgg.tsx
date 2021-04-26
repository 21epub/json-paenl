import React, { FC, Fragment, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TweenOne from 'rc-tween-one';
import BezierPlugin from 'rc-tween-one/lib/plugin/BezierPlugin';
import { getPicture } from '../../../util';
import { StateType } from '../../../store/reducer';
TweenOne.plugins.push(BezierPlugin);

interface SmashEggProps {
  isLotterySuccess: boolean;
  onClick: () => void;
}

const SmashEgg: FC<SmashEggProps> = (props) => {
  const { isLotterySuccess, onClick } = props;
  const [isClick, setIsClick] = useState(false);
  const [play, setPlay] = useState(false);
  const { lotteryDetail, pictureList } = useSelector(
    (state: StateType) => state
  );
  const goodEggPic = getPicture(lotteryDetail.picture, 'goodEgg');
  const badEggPic = getPicture(lotteryDetail.picture, 'badEgg');
  const hammerPic = getPicture(lotteryDetail.picture, 'hammer');
  const defaultGoodEggPic = getPicture(pictureList, 'goodEgg');
  const defaultBadEggPic = getPicture(pictureList, 'badEgg');
  const defaultHammerPic = getPicture(pictureList, 'hammer');

  const onLotteryClick = () => {
    // 隐藏锤子
    setPlay(false);
    // 避免重复点击，只允许点击一次
    if (!isClick) {
      onClick();
      setIsClick(true);
    }
  };

  // 开始播放锤子动画
  const onPlay = () => {
    setPlay(true);
  };

  const animation = {
    bezier: {
      type: 'soft',
      vars: [
        { x: -40, y: 30 },
        { x: -60, y: 50 },
        { x: -70, y: 60 },
        { x: -100, y: 100 }
      ]
    },
    duration: 600,
    onComplete: onLotteryClick
  };

  useEffect(() => {
    if (!isLotterySuccess) {
      setIsClick(false);
    }
  }, [isLotterySuccess]);

  return (
    <div className='SmashEgg' onClick={onPlay}>
      {isClick && isLotterySuccess ? (
        <img className='goldenEggPic' src={badEggPic || defaultBadEggPic} />
      ) : (
        <Fragment>
          <img className='goldenEggPic' src={goodEggPic || defaultGoodEggPic} />
          {play && (
            <TweenOne
              className='code-box-hammer'
              animation={animation}
              reverse={false}
              yoyo={false}
              style={{
                backgroundImage: `url(${hammerPic || defaultHammerPic})`
              }}
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default SmashEgg;
