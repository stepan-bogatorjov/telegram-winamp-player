import {API_BASE_URL} from "./api.ts";

export const getFullUrl = (path: string) => `${API_BASE_URL}${path}`;