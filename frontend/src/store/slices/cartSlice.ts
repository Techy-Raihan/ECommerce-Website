import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem } from '../../types';

interface CartState {
    cart: Cart | null;
    itemCount: number;
}

const initialState: CartState = { cart: null, itemCount: 0 };

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action: PayloadAction<Cart>) => {
            state.cart = action.payload;
            state.itemCount = action.payload.items.reduce((sum, i) => sum + i.quantity, 0);
        },
        clearCartState: (state) => {
            state.cart = null;
            state.itemCount = 0;
        },
    },
});

export const { setCart, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
