import React, { useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { IntlProvider } from 'react-intl';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import './App.css';
import CounterSample from './CounterSample';
import UserPage from './UserPage';
import SettingsPage from './SettingsPage';
import { useTypedSelector } from './app/store';
import { intlActions } from './slices/intlSlice';

function App() {
  const { locale } = useTypedSelector(state => state.intl);
  const dispatch = useDispatch();
  /*
  useEffectで使うコールバックをメモ化する上での成り行きだが、bindActionCreatorsの結果もメモ化する
  メモ化とは、コンポーネントの再レンダリングによってここを何度も通過する際に、
  普通なら毎回生成処理が走るはずのところを、最初に通過した際にキャッシュを作っておき、
  生成に使用した引数（の参照）が変わらなければ生成処理をスキップしてキャッシュを返す仕組みである
  生成にかかる処理コストを節約できる代わりにキャッシュのためにメモリを使うトレードオフとなる
  第一引数には生成処理を実行するコールバックを、
  第二引数にはこれら（の参照）が前回と変わってたらキャッシュを返さず再生成してよって変数を渡す
  intlActionsは渡さなくても警告が出ないのだが、exportした時点で不変なのは明白だからだと思われる
  dispatchは、useDispatchがコンポーネントの中でしか使えず、前回と変わってる可能性があるので指定してるが、
  useDispatchが返す参照は毎回同じなので、この記述は形だけで実際は永遠にキャッシュを使い続けるはずだ
  ちなみにこのプロジェクトでは今の所、Storeは生成済みのものをexportしているので、
  StoreをimportしてStoreのプロパティで取得したdispatchを生成関数に渡せば、
  第二引数を空配列（再生成しない）にしても警告が出なくなる
  */
  const actions = useMemo(() => bindActionCreators(intlActions, dispatch), [dispatch]);
  /*
  languagechangeが発生した際に現在のブラウザ言語をlocaleにセットするコールバックをメモ化したもの
  useEffectの実行をトリガーに再レンダリングが走ると無限ループに陥る可能性があると聞いてビビって入れたが、
  恐らくこの処理でそうなることはない
  ただまあ再生成を防ぐことにも意味はあるし、勉強のためにも入れてみることにした
  第一引数は元々定義したかったコールバックそのもの、第二引数はuseMemoと同じ
  actionsは毎回参照が変わりうるので第二引数に入れないと警告が出るが、
  actionsは実際毎回参照が変わってしまうはずなので、仕方なくactionsもメモ化する運びとなった
  useCallbackはuseMemoでも等価に書けるが、返すものがコールバックの場合若干楽に書けるという感じ
  */
  const setLocaleCallback = useCallback(() => actions.setLocale(navigator.language), [actions]);
  /*
  副作用がある処理を実行したい場合はここに書く
  副作用の概念がなかなか難しいけど、とりあえずDOMの操作を手動でやるときはここでやるべきらしい
  ReactのレンダリングによってDOMがレンダリングされきってから実行されることが保証される
  第一引数は行いたい処理をコールバックで登録すると、コンポーネントのレンダリング後に実行される
  戻り値をコールバックで指定すると、コンポーネントの再レンダリング前に実行される
  この場合、やりたい処理がリスナー登録で、レンダリング後に登録される
  再レンダリングが走ると、戻り値のコールバックでリスナー解除され、レンダリング後に再登録される
  コンポーネントのアンマウント時にはリスナーが解除される
  ここで、第二引数は再レンダリングの際にこれらが変わってなければクリーンアップと再実行を行わないって変数である
  setLocaleCallbackは変わりうる変数なので指定しろと言われるが、
  メモ化してあってこの値は変わらないので空配列を指定しているのと同じこととなり、
  このuseEffectは結果的に初回レンダリング時に本処理実行とアンマウント時にクリーンアップをするだけとなる
  第二引数をそもそも与えない場合、再レンダリング時に必ずクリーンアップと本処理を実行することとなる
  */
  useEffect(() => {
    /*
    languagechangeはブラウザの言語設定を変更したときに発火するイベントで、
    それが起こったときにnavigator.languageが設定した値に変わっているのでそれをStateにセットする
    */
    window.addEventListener('languagechange', setLocaleCallback);
    return () => {
      window.removeEventListener('languagechange', setLocaleCallback);
    };
  }, [setLocaleCallback]);

  return (
    /*
    このProviderは、子孫コンポーネントでIntlShapeを使えるようにするもの
    IntlShapeとはLocaleやMessagesやFormatterなどの情報が入ったオブジェクト
    このProviderに渡されたpropsからProvider内で生成し、子孫に渡している
    子孫側では、useIntlフックで参照できる
    今の場合、localeが変更されるたびにIntlShapeを再生成している
    */
    <IntlProvider locale={locale}>
      {/*
      ContextProviderで、RouterContextとHistoryContextを子孫コンポーネントに渡している
      これによりここより下ではReact Routerのコンポーネントが使えるようになる
      */}
      <BrowserRouter>
        <ul>
          {/*
          普通にa要素とhref属性を使うとページ全体の再読み込みとなり、Stateも破棄されてしまう
          Linkを使うとJSでうまいことやってくれて、リロードなしのページ遷移を実現する
          */}
          <li><Link to='/'>CounterSample</Link></li>
          <li><Link to='/user'>UserPage</Link></li>
          <li><Link to='/settings'>SettingsPage</Link></li>
        </ul>
        {/*
        現在のURLに対し、Switch以下の最初にマッチしたRoute要素のみをレンダリングする
        今はexactを使っているので複数マッチすることはないが、Switchを使わないと複数マッチした場合全てレンダリングされる
        実は実装的には、直下の子コンポーネントを舐めて、path属性などから最初にマッチしたもののみをchildrenとする挙動になっているので、
        子コンポーネントはRouteじゃなくてもRouteと同じpropsを持つものならマッチングする（はず）
        */}
        <Switch>
          {/*
          path属性とマッチしたコンポーネントをレンダリングする
          */}
          <Route exact path="/user" component={UserPage} />
          <Route exact path="/settings" component={SettingsPage} />
          <Route exact path="/" component={CounterSample} />
        </Switch>
      </BrowserRouter>
    </IntlProvider>
  );
}

export default App;
