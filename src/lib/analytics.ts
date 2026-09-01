import api from './api';

export const logEvent = async (
  eventType: 'view_item' | 'add_to_cart' | 'checkout_started' | 'order_placed',
  itemId?: string,
  itemName?: string,
  metadata?: any
) => {
  try {
    // Only log if the user is authenticated (we have a token)
    const token = localStorage.getItem('sewvee_customer_token');
    if (!token) return;

    await api.post('customer-auth/log-event', {
      eventType,
      itemId,
      itemName,
      metadata,
    });
  } catch (error) {
    // Fail silently for analytics events so it doesn't break the UI
    console.warn('Failed to log analytics event:', error);
  }
};
