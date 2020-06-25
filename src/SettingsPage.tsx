import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

const SettingsPage = () => {
  /*
  IntlProvider以下のコンポーネントで、Providerが生成したIntlShapeを参照するフック
  */
  const { locale } = useIntl();

  return (
    <>
      <div>Settings</div>
      {/*
      intlにはProviderに渡したLocaleがそのまま入っており、今はとりあえずそれを出力している
      */}
      <div>Current Locale: {locale}</div>
      {/*
      idにキーを渡すとintlProviderに渡したmessagesから、キー名が一致する値を表示してくれる
      */}
      <div><FormattedMessage id="hello" /> <FormattedMessage id="world" /></div>
    </>
  );
};

export default SettingsPage;
