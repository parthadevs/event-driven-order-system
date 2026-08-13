import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException } from '@nestjs/common';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class HttpClientService {
    constructor(private readonly httpClientService: HttpService) { }

    private handleError = (error: any): never => {
        if (error.response) {
            throw new HttpException(error.response.data, error.response.status);
        }
        throw error;
    };

    async post<T = any>(url: string, data: any): Promise<AxiosResponse<T>> {
        return await firstValueFrom(
            this.httpClientService.post<T>(url, data).pipe(catchError(this.handleError))
        );
    }

    async get<T = any>(url: string): Promise<AxiosResponse<T>> {
        return await firstValueFrom(
            this.httpClientService.get<T>(url).pipe(catchError(this.handleError))
        );
    }

    async put<T = any>(url: string, data: any): Promise<AxiosResponse<T>> {
        return await firstValueFrom(
            this.httpClientService.put<T>(url, data).pipe(catchError(this.handleError))
        );
    }

    async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
        return await firstValueFrom(
            this.httpClientService.delete<T>(url).pipe(catchError(this.handleError))
        );
    }
}
