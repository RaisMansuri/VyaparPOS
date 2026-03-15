export interface Transaction {
    id: number;
    productId: number;
    productName: string;
    category: string;
    quantity: number;
    sellingPrice: number;
    costPrice: number;
    totalPrice: number;
    profit: number;
    timestamp: Date;
}

export interface DashboardStats {
    grossTotal: number;
    netProfit: number;
    totalStockValue: number;
    totalItemsInStock: number;
    lowStockCount: number;
    outOfStockCount: number;
}
