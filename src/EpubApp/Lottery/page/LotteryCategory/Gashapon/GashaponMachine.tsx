import React, { FC, useState } from 'react';
import { Modal } from 'antd';
import { getLotteryResult } from '../../../data/api';
import styles from './index.module.less';
import { UserInfoType, PrizeType } from '../../../type';
import ExportWrapper from './ExportWrapper';
import EggWrapper from './EggWrapper';
import { getPicture } from '../../../util';
import store from '../../../store';

interface TreasureBoxProps {
  prizeList: PrizeType[];
  prizeUrl?: string;
  userInfo?: UserInfoType;
  getData: () => void;
}

const GashaponMachine: FC<TreasureBoxProps> = (props) => {
  const { prizeList, prizeUrl, userInfo, getData } = props;
  const [state] = store.useRxjsStore();
  const {
    lotteryDetail,
    pictureList,
    shouldUserInfoModalShow,
    isClickable
  } = state;
  const glassPic = getPicture(lotteryDetail?.picture ?? [], 'glass');
  const downPic = getPicture(lotteryDetail?.picture ?? [], 'down');
  const startPic = getPicture(lotteryDetail?.picture ?? [], 'start');
  const defaultGlassPic = getPicture(pictureList, 'glass');
  const defaultDownPic = getPicture(pictureList, 'down');
  const defaultStartPic = getPicture(pictureList, 'start');
  const [playEgg, setPlayEgg] = useState(false);
  const [playExport, setPlayExport] = useState(false);

  const lottery = async () => {
    // 先判断是否需要填写信息
    if (
      userInfo?.user_id === null &&
      lotteryDetail?.need_user_info &&
      shouldUserInfoModalShow
    ) {
      store.reducers.setIsUserInfoModalShow(true);
    } else if (
      prizeUrl &&
      (lotteryDetail?.remain_times === null ||
        lotteryDetail?.remain_times === undefined ||
        lotteryDetail?.remain_times > 0)
    ) {
      store.reducers.setIsClickable(false);
      // 抽奖
      try {
        const response = await getLotteryResult(prizeUrl);
        const prize = response?.data?.data?.results[0];
        // 延时1000毫秒弹出获奖结果
        setTimeout(() => {
          Modal.info({
            title: prize.objective.ranking,
            content: (
              <div>
                <hr />
                奖项名:{prize.objective.title}
              </div>
            ),
            onOk() {
              // 重新获取后台的值
              getData();
              store.reducers.setIsClickable(true);
              if (prize?.objective?.prize_type && shouldUserInfoModalShow) {
                store.reducers.setIsUserInfoModalShow(true);
              }
              // 重置动画状态
              setPlayEgg(false);
              setPlayExport(false);
            }
          });
        }, 500);
      } catch (error) {
        Modal.info({
          title: error.response.data,
          okText: '查看我的奖品',
          onOk() {
            setPlayEgg(false);
            setPlayExport(false);
            store.reducers.setIsPrizeModalShow(true);
          }
        });
      }
    } else {
      Modal.info({
        title: '抽奖次数用完啦',
        content: (
          <div>
            <hr />
            <p>您的抽奖次数用完啦！</p>
            <p>无法抽奖，感谢您的参与！</p>
          </div>
        ),
        onOk() {
          setPlayEgg(false);
          setPlayExport(false);
        }
      });
    }
  };

  const onPlayEgg = () => {
    setPlayEgg(true);
  };

  const onComplete = () => {
    if (!playExport) {
      // 防止多次触发
      setPlayExport(true);
    }
  };

  return (
    <div className={styles.gashaponWrap}>
      <img src={glassPic || defaultGlassPic} className='glass' />
      <img src={downPic || defaultDownPic} className='down' />
      <img
        src={startPic || defaultStartPic}
        className='start'
        onClick={onPlayEgg}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      />
      <EggWrapper
        playEgg={playEgg}
        prizeList={prizeList}
        onComplete={onComplete}
      />
      <ExportWrapper playExport={playExport} onClick={lottery} />
    </div>
  );
};

export default GashaponMachine;
