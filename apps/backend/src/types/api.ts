export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export type SendChatRequest = {
  sessionKey?: string;
  pagePath?: string;
  country?: string;
  visitorInfo?: Record<string, string>;
  message: string;
};
