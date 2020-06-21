import React from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';
import './App.css';
import CounterSample from './CounterSample';
import UserPage from './UserPage';
import SettingsPage from './SettingsPage';

function App() {
  return (
    /*
    ContextProviderで、RouterContextとHistoryContextを子孫コンポーネントに渡している
    これによりここより下ではReact Routerのコンポーネントが使えるようになる
    */
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
  );
}

export default App;
