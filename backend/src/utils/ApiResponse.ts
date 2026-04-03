class ApiResponse {
  success: boolean;
  data: any;
  message: string;
  statusCode: number;

  constructor(statusCode: number, data: any, message: string = 'Success') {
    this.success = statusCode < 400;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }
}

export default ApiResponse;
