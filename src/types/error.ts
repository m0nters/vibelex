export class AppException extends Error {
  code: string;
  data?: Record<string, string>; // Optional additional data

  constructor(params: { code: string; data?: Record<string, string> }) {
    super(params.code);
    this.name = "AppException";
    this.code = params.code;
    this.data = params.data;
  }
}
