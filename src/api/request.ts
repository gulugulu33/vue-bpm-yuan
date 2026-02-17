import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'ant-design-vue';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface RequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
  skipErrorHandler?: boolean;
}

class RequestError extends Error {
  code?: number;
  response?: AxiosResponse;

  constructor(message: string, code?: number, response?: AxiosResponse) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
    this.response = response;
  }
}

class HttpRequest {
  private instance: AxiosInstance;
  private retryMap = new Map<string, number>();

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      this.requestInterceptor.bind(this),
      this.requestInterceptorError.bind(this)
    );

    this.instance.interceptors.response.use(
      this.responseInterceptor.bind(this),
      this.responseInterceptorError.bind(this)
    );
  }

  private requestInterceptor(config: InternalAxiosRequestConfig) {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const requestConfig = config as RequestConfig;
    if (!requestConfig.retry) {
      requestConfig.retry = 3;
    }
    if (!requestConfig.retryDelay) {
      requestConfig.retryDelay = 1000;
    }

    return config;
  }

  private requestInterceptorError(error: any) {
    return Promise.reject(error);
  }

  private responseInterceptor<T>(response: AxiosResponse<ApiResponse<T>>): T {
    const { code, message: msg, data } = response.data;

    if (code === 200) {
      return data;
    } else {
      const error = new RequestError(msg || '请求失败', code, response);
      if (!(response.config as RequestConfig).skipErrorHandler) {
        this.handleError(error);
      }
      throw error;
    }
  }

  private async responseInterceptorError(error: any) {
    const config = error.config as RequestConfig;

    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    const retryCount = this.retryMap.get(config.url || '') || 0;

    if (retryCount >= config.retry) {
      this.retryMap.delete(config.url || '');
      const requestError = new RequestError(
        error.response?.data?.message || error.message || '请求失败',
        error.response?.status,
        error.response
      );
      if (!config.skipErrorHandler) {
        this.handleError(requestError);
      }
      return Promise.reject(requestError);
    }

    this.retryMap.set(config.url || '', retryCount + 1);

    const delay = config.retryDelay || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    return this.instance.request(config);
  }

  private handleError(error: RequestError) {
    if (!error.response) {
      message.error('网络错误，请检查网络连接');
      return;
    }

    const { status } = error.response;

    switch (status) {
      case 401:
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        message.error('没有权限访问该资源');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 500:
        message.error('服务器错误，请稍后重试');
        break;
      case 502:
      case 503:
      case 504:
        message.error('服务暂时不可用，请稍后重试');
        break;
      default:
        message.error(error.message || '请求失败');
    }
  }

  public get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.patch(url, data, config);
  }

  public request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance.request(config);
  }
}

const request = new HttpRequest({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
