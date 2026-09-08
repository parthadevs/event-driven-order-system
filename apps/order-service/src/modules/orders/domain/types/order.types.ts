export interface CreateOrderItemData {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  userId: string;
  items: CreateOrderItemData[];
}
