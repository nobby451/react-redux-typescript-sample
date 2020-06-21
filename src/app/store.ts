import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import counterReducer from '../features/counter/counterSlice';
import { userReducer } from '../slices/userSlice';

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
});

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
