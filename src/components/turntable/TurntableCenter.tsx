import { Modal } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppBus } from '../event-bus/event'
import {
  drawPrizeBlock,
  getPrizeIndex,
  getRandomInt,
  prizeToAngle
} from '../util'
import styles from './index.module.less'

interface Props {
  prizeList: any
}

const TurntableCenter = ({ prizeList }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [startRadian, setStartRadian] = useState(0) // 定义圆的角度
  const dispatch = useDispatch()

  // 渲染抽奖盘
  useEffect(() => {
    if (canvasRef?.current) {
      setCtx(canvasRef?.current?.getContext('2d'))
      if (ctx && prizeList.length !== 0) {
        drawPrizeBlock(ctx, prizeList, startRadian)
      }
    }
  }, [ctx, prizeList, startRadian])

  const doRotate = useCallback((prize) => {
    if (prize) {
      rotate(prize).then((res: any) => {
        // 当promise返回成功时
        if (res.status === 'success') {
          // 延时1000毫秒弹出获奖结果
          setTimeout(() => {
            Modal.info({
              title: res.prize.objective.ranking,
              content: (
                <div>
                  <hr />
                  奖项名:{res.prize.objective.title}
                </div>
              ),
              onOk() {
                setStartRadian(0)

                // 通知重新获取后台的值
                AppBus.subject('RequestAgain$').next(prize)

                dispatch({ type: 'isClickable', value: true })
              }
            })
          }, 1000)
        }
      })
    }
  }, [])

  // 监听抽奖动作
  useEffect(() => {
    const subscription = AppBus.subject('Rotate$').subscribe((prize) => {
      doRotate(prize)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 旋转函数
  const rotate = (prize: any) => {
    return new Promise((resolve) => {
      // 获取抽奖结果在奖品list中对应的index
      const prizeIndex = getPrizeIndex(prize, prizeList)

      // 获取目标角度： prizeIndex:prize对应第几个，prizeList.length:prize总数
      const target = prizeToAngle(prizeIndex, prizeList.length)

      const result = {
        status: 'success',
        prize: prize // 获得的奖品
      }

      // 获取随机圈数
      const turns = getRandomInt(5, 15)

      // 将总旋转度数切割为多少份
      const frame = getRandomInt(100, 400)

      for (let i = 1; i <= frame; i += 1) {
        // target为目标角度， 2 * Math.PI 为一圈 ，获取每份度数的大小
        const interval = (target + 2 * Math.PI * turns) / frame
        setTimeout(() => {
          // 设定每次相对原点的旋转度数
          setStartRadian(interval * i)
          // 当到达目标度数时返回结果
          if (i === frame) resolve(result)
        }, 100)
      }
    })
  }

  if (prizeList?.length) {
    for (let i = 0; i < prizeList.length; i++) {
      if (i % 2 === 0)
        Object.defineProperty(prizeList[i], 'color', { value: '#fef8e6' })
      else Object.defineProperty(prizeList[i], 'color', { value: '#fff' })
    }

    return (
      <div className={styles.turntableRotateWrap}>
        <canvas
          id='turnTableCircle'
          ref={canvasRef}
          width='280px'
          height='280px'
        >
          您的浏览器不支持canvas。
        </canvas>
      </div>
    )
  } else {
    return <div />
  }
}

export default TurntableCenter
