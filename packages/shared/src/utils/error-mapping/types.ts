/**
 * Error object interface that includes the new subcode property
 */
export interface ErrorObject {
    code?: string;
    message?: string;
    subcode?: string;
    details?: {
        field?: string;
        [key: string]: unknown;
    };
    errorcode_arr_js?: string[];
}

/**
 * Error message mapping configuration
 */
export interface ErrorMessageMapping {
    [subcode: string]: string;
}
