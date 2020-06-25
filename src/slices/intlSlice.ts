import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  locale: 'ja',
};

export const { actions: intlActions, reducer: intlReducer } = createSlice({
  name: 'intl',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
    },
  },
});
