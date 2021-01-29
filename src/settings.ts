import { config as envConfig } from "dotenv";

envConfig();

export const S3_ACCESS_KEY_ID = process.env["S3_ACCESS_KEY_ID"] || "";
export const S3_SECRET_ACCESS_KEY = process.env["S3_SECRET_ACCESS_KEY"] || "";
export const S3_BUCKET = process.env["S3_BUCKET"] || "";

export const GQL_API_URL = process.env["GQL_API"] || "";
export const GQL_AUTH_HEADER = process.env["GQL_AUTH_HEADER"] || "";
export const GQL_AUTH_HEADER_VALUE = process.env["GQL_AUTH_HEADER_VALUE"] || "";

export const GQL_HEADERS = {};
GQL_HEADERS[GQL_AUTH_HEADER] = GQL_AUTH_HEADER_VALUE;
