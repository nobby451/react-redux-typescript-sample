import { configureStore, ThunkAction, Action, getDefaultMiddleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import counterReducer from '../features/counter/counterSlice';
import { userReducer } from '../slices/userSlice';
import rootSaga from './sagas';

/*
Redux Toolkitがオススメするミドルウェア詰め合わせを取得している
redux-thunkも入っているのだが、redux-sagaを使う選択をした以上出番はないはずなので、
要らなくなったらoptionsで消すべきだろう
*/
const middleware = getDefaultMiddleware();
const sagaMiddleware = createSagaMiddleware();
middleware.push(sagaMiddleware);

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
  },
  /*
  Storeにミドルウェアを設定
  ミドルウェアとは、Reduxの間に挟まってなんか色々便利な処理をしてくれる奴ら
  */
  middleware,
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
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

/*
部分Stateを簡単に取り出すためのuseSelector関数を更に楽に書くための定義
本来例えば全体StateからUserの部分Stateを取り出す場合
const userState = useSelector((state: RootState) => state.user);
と書く必要があるが、全体Stateの型情報を事前に渡したもので再定義することにより、
const userState = useTypedSelector(state => state.user);
でよくなる
*/
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
