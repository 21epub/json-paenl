import React, { FC } from 'react'
import styles from './index.module.less'

interface RemainTimeProps {
  remainTimes: number | null
}

const RemainTime: FC<RemainTimeProps> = (props) => {
  const { remainTimes } = props
  return (
    <div className={styles.remainTime}>
      <div className='remainTimesWrap'>
        {((remainTimes && remainTimes > 0) || remainTimes === 0) &&
          `您还剩余${remainTimes}次抽奖机会`}
      </div>
    </div>
  )
}

export default RemainTime