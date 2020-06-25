import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ja from '../messages/ja';
import en from '../messages/en';

/*
メッセージ定義ファイルをロケールの2文字をキーにマッピングしたオブジェクトを作る
定数ではない文字列をキーにアクセスしたいので、computed propertyを使う
Record<K, T>は、第一引数をstringのunionに、第二引数を任意の型Tを指定すると、
unionの名前のプロパティ名で任意の型Tの値を持つオブジェクトの型を定義できるが、
第一引数をstringにすると、任意のプロパティ名に文字列型の値を持つオブジェクトという定義になる
jaやenはそれで、IntlProviderのmessagesに渡す型がそれとなる
そして、それを値にしてプロパティ名を[]で囲む形にすると、任意の文字列をキーに呼び出せるオブジェクトとなる
[]の中身は[P in string]または[x: string]のように書く（Pやxは何でも構わない）
*/
const messagesMap: { [P in string]: Record<string, string> } = { ja, en };

const initialState = {
  locale: 'ja',
  /*
  ここは直接jaを入れると、具体的なプロパティ名を持つオブジェクトと推論されるので、
  ReducerでRecord<string, string>が代入できなくなる
  最初からこの書き方にしておけば、messagesはRecord<string, string>と推論される
  もちろん本来なら型定義をちゃんと作っておいたほうがよい
  */
  messages: messagesMap['ja'],
};

export const { actions: intlActions, reducer: intlReducer } = createSlice({
  name: 'intl',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
      /*
      localeは「-」区切りの形式で来る可能性があるので、区切って最初の部分を使う
      仮にpayloadが空文字であっても、splitは要素数1の空文字が入った配列を返すので、0番目はundefinedにならない
      ただし、messagesMapに渡したキーが未定義だとundefinedが返るので、null合体演算子でjaを返す
      messagesはRecord<string, string>と推論されているが、
      その条件を満たす具体的なプロパティ名を持つ型を代入することは問題ない
      */
      state.messages = messagesMap[action.payload.split('-')[0]] ?? ja;
    },
  },
});
