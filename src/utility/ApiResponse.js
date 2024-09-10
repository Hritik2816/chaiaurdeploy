class ApiResponse {
  constructor(statussCode, data, message = "Success") {
    this.statussCode = statussCode;
    this.data = data;
    this.message = message;
    this.success = statussCode < 400
  }
}

export { ApiResponse }