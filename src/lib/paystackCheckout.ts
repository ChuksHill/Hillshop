import type { CartItem } from "../context/CartContext";

export interface CheckoutFormData {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    deliveryMethod: string;
    paymentMethod: string;
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
}

export interface PendingPaystackOrder {
    formData: CheckoutFormData;
    items: CartItem[];
    finalTotal: number;
    paystackChargeAmount: number;
}

const PENDING_PAYSTACK_ORDER_KEY = "pendingPaystackOrder";

export function savePendingPaystackOrder(order: PendingPaystackOrder) {
    sessionStorage.setItem(PENDING_PAYSTACK_ORDER_KEY, JSON.stringify(order));
}

export function getPendingPaystackOrder(): PendingPaystackOrder | null {
    const rawOrder = sessionStorage.getItem(PENDING_PAYSTACK_ORDER_KEY);

    if (!rawOrder) {
        return null;
    }

    try {
        return JSON.parse(rawOrder) as PendingPaystackOrder;
    } catch (error) {
        console.error("Failed to parse pending Paystack order", error);
        sessionStorage.removeItem(PENDING_PAYSTACK_ORDER_KEY);
        return null;
    }
}

export function clearPendingPaystackOrder() {
    sessionStorage.removeItem(PENDING_PAYSTACK_ORDER_KEY);
}
