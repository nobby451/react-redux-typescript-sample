import React from 'react';
import { useIntl } from 'react-intl';

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
    </>
  );
};

export default SettingsPage;
