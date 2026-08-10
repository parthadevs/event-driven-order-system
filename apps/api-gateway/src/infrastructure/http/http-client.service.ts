import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class HttpClientService {
    constructor(private readonly httpClientService: HttpService) { }

    async post<T = any>(url: string, data: any): Promise<AxiosResponse<T>> {
        return await firstValueFrom(this.httpClientService.post<T>(url, data));
    }

    async get<T = any>(url: string): Promise<AxiosResponse<T>> {
        return await firstValueFrom(this.httpClientService.get<T>(url));
    }

    async put<T = any>(url: string, data: any): Promise<AxiosResponse<T>> {
        return await firstValueFrom(this.httpClientService.put<T>(url, data));
    }

    async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
        return await firstValueFrom(this.httpClientService.delete<T>(url));
    }
}
