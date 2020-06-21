import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/*
このSliceを作成するStateの初期値であり、この部分Stateのデータ定義でもある
*/
const initialState = {
  name: '',
  age: 0,
};

/*
ActionCreatorとReducerをいい感じにまとめて作ってくれる便利関数
ActionCreatorとは、payloadに当たる引数を渡すとActionを返してくれる関数のこと
Slice自体が必要になることは基本ないためactionsとreducerをexportする
*/
export const { actions: userActions, reducer: userReducer } = createSlice({
  /*
  nameは生成されるActionのtypeのprefixとなる
  例えばsetNameを呼び出すActionであれば、type: 'user/setName'が自動生成される
  ReducerはcombineReducersで1つにまとめるので、他のSliceと被ってはいけない
  */
  name: 'user',
  /*
  このReducerが触ることのできる部分Stateの初期状態を設定する
  */
  initialState,
  /*
  本来Actionのtypeで振り分けなきゃいけないreduce処理を、メソッドライクに書ける
  */
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      /*
      本来Reducerは新しく作成したStateを返す必要があるが、中でうまいことやってくれているらしく、
      状態を変更するだけでいいし、この場合戻り値を返す必要もない
      */
      state.name = action.payload;
    },
    setAge: (state, action: PayloadAction<number>) => {
      state.age = action.payload;
    },
    reset: (_state, _action: PayloadAction<undefined>) => {
      /*
      新たにStateを作成し直す場合はもちろん返す必要がある
      */
      return { name: '', age: 0 };
    },
  },
});

/*
この辺りで
console.log(userActions.setName('Jordan'));
とかやると、
{ type: "user/setName", payload: "Jordan" }
と出力されるはずである
ActionCreatorというのがなんなのかがわかると思う
Reducerの中身を実行するわけではなく、あくまでActionというデータ構造を返すだけである
*/
