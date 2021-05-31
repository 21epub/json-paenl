import React, { FC } from 'react';
import { message } from 'antd';
import { useRequest } from 'ahooks';
import { isEmpty } from 'lodash';
import {
  QueryUserInfo,
  AddActivity,
  UpdateUserInfo,
  AddUserInfo,
  QueryActivityList
} from '../../data/api';
import type { AssistanceDetailType, ObjectiveDetailType } from '../../type';
import store from '../../store';
import { Wrapper } from './Styled';

interface SignUpInfoProps {
  AssistanceDetail: AssistanceDetailType;
  ObjectiveDetail: ObjectiveDetailType;
  onClose: () => void;
}

export interface UserInfo {
  [key: string]: string;
}

// 填写用户信息弹窗
const SignUpInfo: FC<SignUpInfoProps> = (props) => {
  const { AssistanceDetail, ObjectiveDetail, onClose } = props;
  const { user_info_id } = ObjectiveDetail;
  const { user_info_fields } = AssistanceDetail;
  const userInfo: UserInfo = {};

  // 请求用户信息
  const { data: UserInfoValue } = useRequest(
    () => QueryUserInfo(ObjectiveDetail?.slug, user_info_id!),
    {
      ready: !!user_info_id,
      throwOnError: true
    }
  );

  // 新增用户注册登记信息
  const { run: RunAddUserInfo } = useRequest(AddUserInfo, {
    manual: true,
    throwOnError: true
  });

  // 用户新建助力活动
  const { run: RunAddActivity } = useRequest(AddActivity, {
    manual: true,
    throwOnError: true,
    onSuccess: (ActivityDetail) => {
      store.reducers.setActivityDetail(ActivityDetail);
      store.reducers.changePage('MyAssistancePage');
    }
  });

  // 查询用户助力活动
  const { run: RunQueryActivityList } = useRequest(QueryActivityList, {
    manual: true,
    throwOnError: true,
    onSuccess: (ActivityList: AssistanceDetailType[]) => {
      if (isEmpty(ActivityList) && AssistanceDetail?.slug) {
        // 未发起过助力，进行发起助力
        RunAddActivity(AssistanceDetail?.slug, ObjectiveDetail.slug);
        // 添加并保存用户信息
        RunAddUserInfo(ObjectiveDetail.slug, userInfo);
      } else {
        // 发起过助力，跳转到我的助力页
        store.reducers.changePage('MyAssistancePage');
      }
    }
  });

  // 更新用户注册信息
  const { run: RunUpdateUserInfo } = useRequest(UpdateUserInfo, {
    manual: true,
    throwOnError: true,
    onSuccess: () => {
      onClose();
    }
  });

  const onOk = () => {
    // 有用户id，说明已发起过助力活动，更新用户登记信息即可
    if (ObjectiveDetail?.user_info_id) {
      // 修改完善信息
      RunUpdateUserInfo(
        ObjectiveDetail?.slug,
        ObjectiveDetail?.user_info_id,
        userInfo
      );
    } else if (
      userInfo.name &&
      userInfo.phone &&
      userInfo.address &&
      AssistanceDetail?.slug
    ) {
      // 查询当前用户是否发起助力过
      RunQueryActivityList(AssistanceDetail?.slug, ObjectiveDetail.slug);
    } else {
      message.error('用户信息未填写完整');
    }
  };

  return (
    <Wrapper>
      <div className='block c-div DIV_5eZtqX2'>
        <div className='c-div DIV_sVS1zF'>
          <i className='fa fa-user c-icon' />
          <p className='c-paragraph P_PedtjQ'>完善报名信息</p>
        </div>
        <div className='bottom-border c-div'>
          <div className='c-div DIV_bEvLxo'>
            {user_info_fields?.map((item: string) => {
              return (
                <input
                  key={item}
                  className='c-input'
                  value={UserInfoValue?.[item]}
                  placeholder={item}
                  type='text'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    userInfo[item] = e.target.value;
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className='c-div DIV_PJeoHZ'>
          <a className='btn c-linkblock A_54k3OP' href='#' onClick={onOk}>
            <p className='c-paragraph P_j3Tuu5'>确 定</p>
          </a>
        </div>
        <div className='c-div DIV_1oQBRM'>
          <div className='c-div DIV_C5SD6H' />
          <a className='c-linkblock A_0QSz5t' href='#' onClick={onClose}>
            ×
          </a>
        </div>
      </div>
    </Wrapper>
  );
};

export default SignUpInfo;
