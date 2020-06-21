import React from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { userActions } from './slices/userSlice';
import { useTypedSelector } from './app/store';
import { DETECT_IP } from './app/sagas';

const UserPage = () => {
  /*
  redux-sagaのタスクにActionをdispatchするために、dispatchを外出しする
  （useDispatch()の戻り値を直接bindするとcreateSliceで生成されたActionしかdispatchできないため）
  ただ、せっかくcreateSliceの自動生成でイケイケになったのに一部手動定義するのはイケてないので、
  パフォーマンスに問題がないのであればActionを作るためだけのダミーのReducerを作るのもいいかもしれん
  */
  const dispatch = useDispatch();
  /*
  useDispatchは、storeからdispatchを取得するHook
  react-reduxのProviderでstoreを渡された場所以下のコンポーネントで使える
  dispatchは、Actionを受け取ってReducerに渡す関数
  本来useDispatch()を変数で受けて、
  const dispatch = useDispatch();
  dispatch(userActions.setName('Jordan'));
  のように使うものだが、bindActionCreatorsを使うと、
  ActionCreatorと同じシグネチャーで、dispatchを噛まして呼んだのと同じ関数群をもつオブジェクトが返る
  ActionCreatorはあくまでActionというデータ構造を返す関数で、dispatchを忘れるとStateになんの影響も与えないが、
  これを挟むことでdispatch忘れを防止できる
  */
  const actions = bindActionCreators(userActions, dispatch);
  /*
  全体Stateを引数に部分Stateを返す関数を渡すことで、部分Stateを取得するHook
  配列やObjectで複数の部分Stateを返し、分割代入で受けることもできるし、
  部分Stateの必要な部分だけを更に分割代入してもよい
  */
  const { name, age, ip } = useTypedSelector(state => state.user);

  return (
    <>
      <div>User</div>
      <div><input value={name} onChange={e => actions.setName(e.target.value)} /></div>
      <div>{name}</div>
      <div><input value={age} type="number" onChange={e => actions.setAge(e.target.valueAsNumber)} /></div>
      <div>{age}</div>
      <div><button onClick={_e => actions.reset()}>Reset</button></div>
      {/*
      SagaにActionをdispatchするために、手動で定義したtypeを入れる
      */}
      <div><button onClick={_e => dispatch({ type: DETECT_IP })}>Detect IP</button></div>
      <div>{ip}</div>
    </>
  );
};

export default UserPage;
