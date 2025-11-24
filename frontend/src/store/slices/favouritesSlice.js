import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: []
};

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addFavourite: (state, action) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFavourite: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearFavourites: (state) => {
      state.items = [];
    }
  }
});

export const { addFavourite, removeFavourite, clearFavourites } = favouritesSlice.actions;
export default favouritesSlice.reducer;
