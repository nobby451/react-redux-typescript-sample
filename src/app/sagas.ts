import { call, put, takeEvery, all, delay } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { userActions } from '../slices/userSlice';
import { counterSlice } from '../features/counter/counterSlice';

/*
いい感じにAction typeだけ機械的に生成してくれる方法はなさそうなので、自分で定義する
*/
export const DETECT_IP = 'detectIp';
/*
incrementAsyncのActionCreatorをRedux Toolkitを使って作成
numberを一つ受け取っていたので型引数に追加してやる
これで、{ type: string, payload: number }という型のActionを作成できる
*/
export const incrementAsync = createAction<number>('incrementAsync');

/*
ジェネレーター関数をasync関数にすることはできないっぽいので、async関数の部分は外に出しておく
*/
async function fetchDelay() {
  /*
  非同期通信で時間がかかってることを表現するために、httpbin.orgのdelay APIを使う
  本当はAxiosを使うのだが、面倒だったのでfetchで代用
  ネットワークレスポンスの型は実行時にしかわからないので、推論がanyになってしまうのはどうしょうもない
  関数の戻り値をある型と見なすことはできるので、本当は型定義をして変数の型を明示する
  */
  const json = await fetch(new Request('https://httpbin.org/delay/1')).then(value => value.json());
  /*
  本当はjsonの型を定義すべきだが、面倒なのでas使っちゃう（ダメ。ゼッタイ。）
  */
  return json.origin as string;
}

function* detectIp() {
  /*
  副作用のある処理や非同期の処理はcallを使って呼び出す
  Promiseを返すasync関数であっても、結果を待機した上で返してくれる
  もっとも、async関数でない場合はcallで囲む必要はないのであるが
  redux-saga最大のイケてないポイントであるが、ジェネレーター関数の中ではyieldの評価値がanyになってしまう
  関数の戻り値から明らかに推論可能な場合においても、である
  ネットワークレスポンスの型が推論できないのはまあしょうがないが、これは納得いかねー
  */
  const origin: string = yield call(fetchDelay);
  /*
  ジェネレーター関数の中でdispatchするには、putを使う
  userActions.setIpはあくまでActionCreatorであり、その戻り値はActionである
  そして、putの戻り値はPutEffectというオブジェクトなので、yieldを付け忘れると何も起こらない
  yieldを付けて初めてdispatchされたのと同じこととなり、ActionはReducerに送られる
  これで、見事時間のかかる処理をReduxで扱えることとなった
  */
  yield put(userActions.setIp(origin));
}

export default function* rootSaga() {
  /*
  sagaMiddlewareでrunするSagaを複数登録する場合allを使って、配列またはobjectで連結する
  allの用途は、複数の副作用関数を渡して全て完了するまで待機だったと思うが、
  何故runしたいSagaを複数登録するのに使えるかはよくわからない
  */
  yield all([
    /*
    takeEveryは手抜き用のヘルパー関数ってやつで、本来はジェネレーター関数の中では、
    whileでループしてdispatchされるのを待ち受けるループを作り、takeという関数でdispatchが来るまでループを一時停止し、
    dispatchが来たらTaskをfork（スレッドを作るみたいなイメージ）してcallやputを実行って感じの流れなのだが、
    takeEveryはそれをまとめてやってくれるって感じのやつである
    第一引数はActionのtypeで、これと同じtypeでどこかでdispatchされたら、第二引数のジェネレーター関数を実行する
    takeEveryはdispatchが来た回数だけforkして、全てのTaskを並列でこなすのだが、
    takeLatestというのもあり、こちらは前のTaskが終わってないとそれをcancelして新しいTaskをforkする
    恐らくネットワークのフェッチはtakeLatestの方が適しているであろう
    */
    takeEvery(DETECT_IP, detectIp),
    /*
    redux-thunkで実装していた非同期インクリメントをredux-sagaで実装する
    ActionのtypeはActionCreatorから参照する
    ジェネレーター関数に渡る引数はActionまんまなので、incrementAsyncのReturnTypeを指定する
    setTimeoutしていたところはdelayにする
    1000ms経過したらincrementByAmountをdispatchする
    今回は処理も少ないし、せっかくなのでインラインで書いてみた
    */
    takeEvery(incrementAsync.type, function* (action: ReturnType<typeof incrementAsync>) {
      yield delay(1000);
      yield put(counterSlice.actions.incrementByAmount(action.payload));
    }),
  ]);

  /*
  なお、わかりやすさのためにジェネレーター関数とasync関数に分解して書いたが、以下の書き方でも同等である
  yield takeEvery(DETECT_IP, function* () {
    const json = yield call(() => fetch(new Request('https://httpbin.org/delay/1')).then(value => value.json()));
    yield put(userActions.setIp(json.origin as string));
  });
  関数を使い回すことがなく、名付けが苦手な人はこれもありかもしれない（ただしasはダメ。ゼッタイ。）
  */
}
