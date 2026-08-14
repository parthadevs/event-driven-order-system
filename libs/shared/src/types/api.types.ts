export type ApiResponse<T> = {
    success: boolean;
    code: number;
    message: string;
    timestamp: string;
    data: T;
};