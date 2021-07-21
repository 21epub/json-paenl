import React, { FC } from 'react';
import store from '../../../store';
import styles from './index.module.less';
import TurntableCenter from './TurntableCenter';
import {
  ActivityTime,
  RemainTime,
  MyPrizeButton,
  RulesButton,
  RollingList,
  ContactInfo
} from '../../../components';
import { LotteryUserInfoType, PrizeType, WinnerType } from '../../../type';

interface TurntableProps {
  prizeList: PrizeType[];
  winnerList: WinnerType[];
  userInfo?: LotteryUserInfoType;
  prizeUrl?: string;
  getData: () => void;
}

// 大转盘抽奖
const Turntable: FC<TurntableProps> = (props) => {
  const { winnerList, prizeList, userInfo, prizeUrl, getData } = props;
  const [state] = store.useRxjsStore();
  const { lotteryDetail } = state;
  const {
    start_time,
    end_time,
    remain_times,
    show_contact_info,
    show_rolling_list,
    contact_info,
    rules,
    show_activity,
    show_remain_time,
    show_self_prize,
    show_activity_rule
  } = lotteryDetail ?? {};

  return (
    <div className={styles.turntableWrap}>
      <ActivityTime
        startTime={start_time}
        endTime={end_time}
        isShow={show_activity}
      />
      <RemainTime remainTimes={remain_times} isShow={show_remain_time} />
      <TurntableCenter
        prizeList={prizeList}
        userInfo={userInfo}
        prizeUrl={prizeUrl}
        getData={getData}
      />
      <MyPrizeButton myPrizeListUrl={prizeUrl} isShow={show_self_prize} />
      <RulesButton rules={rules} isShow={show_activity_rule} />
      <RollingList
        winnerList={winnerList}
        isShow={show_rolling_list}
        prizeUrl={prizeUrl}
      />
      <ContactInfo contactInfo={contact_info} isShow={show_contact_info} />
    </div>
  );
};

export default Turntable;
