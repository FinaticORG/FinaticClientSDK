/**
 * Response utility functions for unwrapping axios responses.
 *
 * Generated - do not edit directly.
 */

/**
 * Unwrap axios response to get the actual response data.
 *
 * OpenAPI-generated typescript-axios client returns AxiosPromise<T>, which resolves to AxiosResponse.
 * The actual response body (FinaticResponse structure) is in response.data.
 *
 * @param axiosResponse - The response from an axios API call (may be AxiosResponse or already unwrapped)
 * @returns The unwrapped response data (FinaticResponse structure)
 */
export function unwrapAxiosResponse<T = any>(axiosResponse: any): T {
  // Check if response has .data property (AxiosResponse object)
  if (axiosResponse && typeof axiosResponse === 'object' && 'data' in axiosResponse) {
    return axiosResponse.data as T;
  }
  // Already unwrapped or not an axios response, return as-is
  return axiosResponse as T;
}
