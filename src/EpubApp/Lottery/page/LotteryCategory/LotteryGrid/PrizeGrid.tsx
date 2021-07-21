import React, { FC, useEffect, useState } from 'react';
import { Modal, Space } from 'antd';
import store from '../../../store';
import {
  getIndexList,
  getPicture,
  getPrizeIndex,
  formatPictureUrl
} from '../../../util';
import { getLotteryResult } from '../../../data/api';
import styles from './index.module.less';
import { cloneDeep } from 'lodash';
import type { LotteryUserInfoType, PrizeType } from '../../../type';

interface PrizeGridProps {
  prizeList: PrizeType[];
  prizeUrl?: string;
  userInfo: LotteryUserInfoType;
  getData: () => void;
}

const PrizeGrid: FC<PrizeGridProps> = (props) => {
  const { prizeList, prizeUrl, userInfo, getData } = props;
  const [state] = store.useRxjsStore();
  const {
    lotteryDetail,
    pictureList,
    isClickable,
    lotteryUrlList,
    lotteryEvent
  } = state;
  const [activeIndex, setActiveIndex] = useState<undefined | number>();
  const [itemList, setItemList] = useState<PrizeType[]>([]);
  const gridBg1Pic = getPicture(lotteryDetail?.picture ?? [], 'gridBg1');
  const prizeBgPic = getPicture(lotteryDetail?.picture ?? [], 'prizeBg');
  const startBgPic = getPicture(lotteryDetail?.picture ?? [], 'startBg');
  const defaultGridBg1Pic = getPicture(pictureList, 'gridBg1');
  const defaultPrizeBgPic = getPicture(pictureList, 'prizeBg');
  const defaultStartBgPic = getPicture(pictureList, 'startBg');
  const defaultPrizePic = getPicture(pictureList, 'prize');
  const [pointerEvents, setPointerEvents] = useState<'none' | 'auto'>('auto');
  const [lotteryState, setLotteryState] = useState<string | undefined>();
  const getState = async () => {
    switch (lotteryState) {
      case 'checkTime':
        if (state.betweenActiviyTime) {
          setLotteryState('checkRemainTimes');
        } else {
          store.reducers.setIsActivityTimeModalShow(true);
          setLotteryState(undefined);
        }
        break;
      case 'checkRemainTimes':
        if (
          lotteryDetail?.remain_times === null ||
          lotteryDetail?.remain_times === undefined ||
          lotteryDetail?.remain_times > 0
        ) {
          setLotteryState('checkNeedUserInfo');
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
            onOk() {}
          });
        }
        break;
      case 'checkNeedUserInfo':
        if (lotteryDetail?.need_user_info) {
          setLotteryState('checkIsUserInfoFilled');
        } else {
          setLotteryState('lottery');
        }
        break;
      case 'checkIsUserInfoFilled':
        if (userInfo?.user_id === null) {
          setLotteryState('checkUserInfoFillRules');
        } else {
          setLotteryState('lottery');
        }
        break;
      case 'checkUserInfoFillRules':
        if (lotteryDetail?.fill_rules === 0) {
          // 先填写后抽奖
          store.reducers.setIsUserInfoModalShow(true);
        } else {
          // 先抽奖后填写
          store.reducers.setShowUserModalAfterLottery(true);
          setLotteryState('lottery');
        }
        break;
      case 'lottery':
        try {
          const response = await getLotteryResult(prizeUrl);
          const prize = response?.data?.data?.results[0];
          if (prize) {
            store.reducers.setIsClickable(false);
            let prizeIndex = getPrizeIndex(prize, prizeList);
            // 跳过开始抽奖按钮
            if (prizeIndex > 3) prizeIndex = prizeIndex + 1;
            const turnList = [0, 1, 2, 5, 8, 7, 6, 3];
            const indexList = getIndexList(prizeIndex, turnList);
            let i = 0;
            const timeId = setInterval(() => {
              setActiveIndex(indexList[i]);
              i += 1;
              if (i >= indexList.length) {
                clearInterval(timeId);
                // 延时1000毫秒弹出获奖结果
                setTimeout(() => {
                  Modal.info({
                    title: prize.objective.ranking,
                    content: (
                      <Space
                        size='large'
                        align='center'
                        style={{ marginLeft: '-38px' }}
                      >
                        <img
                          src={formatPictureUrl(
                            prize.objective.picture,
                            lotteryUrlList?.web_url
                          )}
                          style={{ width: '100px' }}
                        />
                        <span>奖项名:{prize.objective.title}</span>
                      </Space>
                    ),
                    onOk() {
                      setActiveIndex(undefined);
                      if (lotteryEvent) {
                        if (prize?.objective?.prize_type === 0) {
                          // 抽中空奖时触发
                          lotteryEvent.onLotteryEmpty();
                        } else if (prize?.objective?.prize_type === 1) {
                          // 抽中奖品时触发
                          lotteryEvent.onLotterySuccess();
                        }
                      }
                      if (
                        prize?.objective?.prize_type &&
                        state.showUserModalAfterLottery
                      ) {
                        store.reducers.setIsUserInfoModalShow(true);
                      }
                      store.reducers.setIsClickable(true);
                      // 重新获取后台的值
                      getData();
                    }
                  });
                }, 1000);
              }
            }, 100);
          }
        } catch (error) {
          Modal.info({
            title: error.response.data,
            okText: '查看我的奖品',
            onOk() {
              store.reducers.setIsPrizeModalShow(true);
            }
          });
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (lotteryState) {
      getState();
    }
  }, [lotteryState]);

  const lottery = async () => {
    setLotteryState('checkTime');
  };

  useEffect(() => {
    const temp = cloneDeep(prizeList);
    setItemList(temp);
  }, [prizeList]);

  useEffect(() => {
    setPointerEvents(isClickable ? 'auto' : 'none');
  }, [isClickable]);

  if (itemList?.length) {
    itemList?.length === 8 &&
      itemList.splice(4, 0, {
        id: 'lotteryButton',
        ranking: 'lotteryButton'
      } as PrizeType);

    const prizeBackground = `url(${prizeBgPic || defaultPrizeBgPic})`;
    const startBackground = `url(${startBgPic || defaultStartBgPic})`;

    return (
      <div
        className={styles.prizeGridWrap}
        style={{ pointerEvents: lotteryEvent ? pointerEvents : 'none' }}
      >
        <div
          className='gridBg'
          style={{
            backgroundImage: `url(${gridBg1Pic || defaultGridBg1Pic})`,
            backgroundSize: '100% 100%',
            height: '300px',
            width: '300px',
            display: 'grid',
            paddingTop: '26px',
            paddingLeft: '25px',
            gridTemplateColumns: '83px 83px 83px',
            gridTemplateRows: '83px 83px 83px'
          }}
        >
          {itemList.map((it, index: number) => {
            return (
              <div
                key={it.id}
                className={index === activeIndex ? 'active' : ''}
                style={{
                  backgroundImage: `${
                    index === 4 ? startBackground : prizeBackground
                  }`,
                  backgroundSize: '100% 100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: `${
                    index === 4 && isClickable ? 'pointer' : 'default'
                  }`,
                  margin: '4px'
                }}
                onClick={index === 4 ? () => lottery() : undefined}
              >
                {index !== 4 && (
                  <img
                    src={formatPictureUrl(
                      it.picture || defaultPrizePic,
                      lotteryUrlList?.web_url
                    )}
                    width='40%'
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return <div />;
};

export default PrizeGrid;
