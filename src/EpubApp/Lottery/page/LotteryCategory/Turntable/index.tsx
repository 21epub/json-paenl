import React, { FC } from 'react'
import styles from './index.module.less'
import TurntableCenter from './TurntableCenter'
import {
  ActivityTime,
  RemainTime,
  MyPrizeButton,
  RulesButton,
  RollingList,
  ContactInfo
} from '../../../Components'

interface TurntableProps {
  prizeList: any
  winnerList: any
  singleLottery: any
  userInfo: any
  isClickable: boolean
  prefix: string
  pointer: string
  turntable: string
  myPrizeListUrl: string
  prizeUrl?: string
}

// 大转盘抽奖
const Turntable: FC<TurntableProps> = (props) => {
  const {
    winnerList,
    pointer,
    prizeList,
    userInfo,
    singleLottery,
    isClickable,
    prefix,
    turntable,
    myPrizeListUrl,
    prizeUrl
  } = props

  const {
    start_time,
    end_time,
    remain_times,
    show_contact_info,
    show_rolling_list,
    contact_info,
    rules,
    picture = {}
  } = singleLottery?.[0] ?? {}

  const { myPrize, rule } = picture

  return (
    <div className={styles.turntableWrap}>
      <ActivityTime startTime={start_time} endTime={end_time} />
      {prizeList?.length && (
        <TurntableCenter
          pointer={pointer}
          isClickable={isClickable}
          prizeList={prizeList}
          singleLottery={singleLottery}
          userInfo={userInfo}
          prefix={prefix}
          prizeUrl={prizeUrl}
          turntable={turntable}
        />
      )}
      <RemainTime remainTimes={remain_times} />
      <MyPrizeButton
        url={myPrize}
        myPrizeListUrl={myPrizeListUrl}
        prefix={prefix}
      />
      <RulesButton url={rule} rules={rules} isButtonClickable prefix={prefix} />
      <RollingList winnerList={winnerList} isShow={show_rolling_list} />
      <ContactInfo contactInfo={contact_info} isShow={show_contact_info} />
    </div>
  )
}

export default Turntable