import { configureStore, /* ThunkAction, Action */ } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import counterReducer from '../features/counter/counterSlice';
import { userReducer } from '../slices/userSlice';
import { intlReducer } from '../slices/intlSlice';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

/*
このアプリで使用するRedux Storeを作成する
*/
export const store = configureStore({
  /*
  複数のReducerを合体させるためには本来combineReducersが必要だが、
  configureStoreにその機能があるのでここに並べて書けばいい
  各ReducerのinitialStateで定義された部分Stateを合わせたものが、アプリ全体のStateとなる
  */
  reducer: {
    counter: counterReducer,
    user: userReducer,
    intl: intlReducer,
  },
  /*
  Storeにミドルウェアを設定
  ミドルウェアとは、dispatchされたActionがReducerに渡る前にインターセプトして色々な処理をするモジュール
  複数追加した場合チェーンで次のミドルウェアに渡し、最終的にReducerに届く
  getDefaultMiddlewareはRedux Toolkitがオススメするミドルウェア詰め合わせを取得する
  redux-thunkも入っているのだが、redux-sagaに置き換えて不要になったので、optionsで取得しないように設定する
  最新バージョンからミドルウェアの配列以外に、getDefaultMiddlewareを引数にミドルウェアの配列を返す関数を渡せるようになった
  TypeScriptで型情報が欠落するのを防げるらしいが、どう変わったかはよくわからない
  だがせっかくなので使ってみる程度
  */
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

/*
Sagaってのはスレッドみたいなもの（厳密には違うらしい？）が裏で待ち受けて、
Actionのdispatchを受け取ったら非同期処理や副作用のある処理をして、
その結果を受けてまたActionをdispatchしてReducerに渡すもんらしい
Reducerの中でそれらの処理をすると不都合が起こるので、Sagaに依頼する感じみたい
で、ここでSagaを待機状態にしてる
*/
sagaMiddleware.run(rootSaga);

/*
全体Stateの型情報を定義している
ReturnTypeは関数の型定義から戻り値の型を取得するUtility Types
store.getStateは全体Stateを返す関数で、typeofしているのでその関数の型定義となり、
ReturnTypeで戻り値である全体Stateの型定義を取得できるというわけである
*/
export type RootState = ReturnType<typeof store.getState>;
/* export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>; */

/*
部分Stateを簡単に取り出すためのuseSelector関数を更に楽に書くための定義
本来例えば全体StateからUserの部分Stateを取り出す場合
const userState = useSelector((state: RootState) => state.user);
と書く必要があるが、全体Stateの型情報を事前に渡したもので再定義することにより、
const userState = useTypedSelector(state => state.user);
でよくなる
*/
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
