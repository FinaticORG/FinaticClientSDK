/**
 * Pagination utilities for TypeScript SDK.
 * 
 * Provides PaginatedData class for wrapping paginated responses with helper methods.
 */

/**
 * Standard FinaticResponse type for all API responses.
 * 
 * This matches the FinaticResponse interface defined in wrapper files.
 */
export interface FinaticResponse<T> {
  '_id'?: string;
  /**
   * Success payload containing data and optional meta
   */
  'success': {
    'data': T;
    'meta'?: { [key: string]: any; } | null;
  };
  'error'?: { [key: string]: any; } | null;
  'warning'?: Array<{ [key: string]: any; }> | null;
}

export interface PaginationMeta {
  has_more: boolean;
  next_offset: number | null;
  current_offset: number;
  limit: number;
}

/**
 * PaginatedData wraps a data array with pagination metadata and helper methods.
 * 
 * This class behaves like an array, so you can use it directly:
 * - paginatedData.length returns the number of items
 * - paginatedData[0] returns the first item
 * - paginatedData.forEach(...) works directly
 * - paginatedData.map(...) works directly
 * 
 * It also provides pagination methods:
 * - hasMore: Check if there are more pages
 * - nextPage(): Get the next page
 * - prevPage(): Get the previous page
 * - firstPage(): Get the first page
 * - lastPage(): Get the last page
 * 
 * @template T - The element type (e.g., FDXBrokerAccount)
 * 
 * Usage:
 * ```typescript
 * const response = await sdk.getAccounts();
 * const accounts = response.success.data;  // Can use directly as array!
 * console.log(accounts.length);  // Works directly
 * console.log(accounts[0]);  // Works directly
 * accounts.forEach(account => console.log(account));  // Works directly
 * 
 * if (accounts.hasMore) {
 *   const nextPage = await accounts.nextPage();  // Returns PaginatedData<FDXBrokerAccount>
 *   const nextAccounts = nextPage;  // Can use directly as array too!
 * }
 * ```
 */
export class PaginatedData<T> {
  constructor(
    public items: T[], // The actual data array
    private meta: PaginationMeta,
    // Use any for method type since it's only called for paginated endpoints
    // and will return PaginatedData<T> at runtime
    private originalMethod: (params?: any) => Promise<any>,
    private currentParams: any,
    private wrapperInstance: any // Reference to wrapper for method calls
  ) {
    // Create a Proxy to allow array-like indexing (paginatedData[0])
    return new Proxy(this, {
      get(target, prop) {
        // Handle numeric indices
        if (typeof prop === 'string' && /^\d+$/.test(prop)) {
          return target.items[Number(prop)];
        }
        // Handle length property
        if (prop === 'length') {
          return target.items.length;
        }
        // Handle array methods and other properties
        return (target as any)[prop];
      },
      has(target, prop) {
        // Support 'in' operator
        if (typeof prop === 'string' && /^\d+$/.test(prop)) {
          return Number(prop) < target.items.length;
        }
        return prop in target;
      },
      ownKeys(target) {
        // Include numeric indices for Object.keys()
        const keys = Object.keys(target);
        for (let i = 0; i < target.items.length; i++) {
          keys.push(String(i));
        }
        return keys;
      },
      getOwnPropertyDescriptor(target, prop) {
        if (typeof prop === 'string' && /^\d+$/.test(prop)) {
          const index = Number(prop);
          if (index < target.items.length) {
            return {
              enumerable: true,
              configurable: true,
              value: target.items[index],
            };
          }
        }
        return Object.getOwnPropertyDescriptor(target, prop);
      },
    }) as PaginatedData<T>;
  }

  /**
   * Get the number of items (allows paginatedData.length).
   */
  get length(): number {
    return this.items.length;
  }

  /**
   * Check if there are more pages available.
   */
  get hasMore(): boolean {
    return this.meta.has_more;
  }

  // Array-like methods - delegate to items array
  /**
   * Calls a function for each element in the array.
   */
  forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
    return this.items.forEach(callbackfn, thisArg);
  }

  /**
   * Creates a new array with the results of calling a function for every array element.
   */
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
    return this.items.map(callbackfn, thisArg);
  }

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   */
  filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[] {
    return this.items.filter(callbackfn, thisArg);
  }

  /**
   * Returns the value of the first element in the array where predicate is true.
   */
  find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined {
    return this.items.find(predicate, thisArg);
  }

  /**
   * Returns the index of the first element in the array where predicate is true.
   */
  findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number {
    return this.items.findIndex(predicate, thisArg);
  }

  /**
   * Returns a section of an array.
   */
  slice(start?: number, end?: number): T[] {
    return this.items.slice(start, end);
  }

  /**
   * Determines whether an array includes a certain element.
   */
  includes(searchElement: T, fromIndex?: number): boolean {
    return this.items.includes(searchElement, fromIndex);
  }

  /**
   * Returns the index of the first occurrence of a value in an array.
   */
  indexOf(searchElement: T, fromIndex?: number): number {
    return this.items.indexOf(searchElement, fromIndex);
  }

  /**
   * Returns a string representation of an array.
   */
  toString(): string {
    return this.items.toString();
  }

  /**
   * Returns a string representation of an array.
   */
  toLocaleString(): string {
    return this.items.toLocaleString();
  }

  /**
   * Convert to JSON - returns just the items array for serialization.
   * This allows clean serialization without exposing internal methods.
   * 
   * @returns The items array
   * 
   * @example
   * ```typescript
   * const orders = await sdk.getOrders();
   * console.log(orders);  // Shows full PaginatedData with methods
   * console.log(orders.toJSON());  // Shows just the items array
   * JSON.stringify(orders);  // Automatically uses toJSON()
   * ```
   */
  toJSON(): T[] {
    return this.items;
  }

  /**
   * Get the next page of data.
   * @returns Promise<PaginatedData<T>> - The next page (not wrapped in FinaticResponse)
   * @throws Error if no more pages are available
   */
  async nextPage(): Promise<PaginatedData<T>> {
    if (!this.hasMore) {
      throw new Error('No more pages available');
    }
    if (this.meta.next_offset === null) {
      throw new Error('Next offset is null');
    }
    const newParams = {
      ...this.currentParams,
      offset: this.meta.next_offset,
    };
    const response = await this.originalMethod.call(
      this.wrapperInstance,
      newParams
    );
    if (!response.success) {
      throw new Error(
        (response.error as any)?.message || 'Failed to fetch next page'
      );
    }
    return response.success.data as PaginatedData<T>; // Return PaginatedData directly
  }

  /**
   * Get the previous page of data.
   * @returns Promise<PaginatedData<T>> - The previous page (not wrapped in FinaticResponse)
   * @throws Error if fetch fails
   */
  async prevPage(): Promise<PaginatedData<T>> {
    const prevOffset = Math.max(0, this.meta.current_offset - this.meta.limit);
    const newParams = {
      ...this.currentParams,
      offset: prevOffset,
    };
    const response = await this.originalMethod.call(
      this.wrapperInstance,
      newParams
    );
    if (!response.success) {
      throw new Error(
        (response.error as any)?.message || 'Failed to fetch previous page'
      );
    }
    return response.success.data as PaginatedData<T>; // Return PaginatedData directly
  }

  /**
   * Get the first page of data.
   * @returns Promise<PaginatedData<T>> - The first page (not wrapped in FinaticResponse)
   * @throws Error if fetch fails
   */
  async firstPage(): Promise<PaginatedData<T>> {
    const newParams = {
      ...this.currentParams,
      offset: 0,
    };
    const response = await this.originalMethod.call(
      this.wrapperInstance,
      newParams
    );
    if (!response.success) {
      throw new Error(
        (response.error as any)?.message || 'Failed to fetch first page'
      );
    }
    return response.success.data as PaginatedData<T>; // Return PaginatedData directly
  }

  /**
   * Get the last page of data.
   * Uses iterative approach to find the last page.
   * @returns Promise<PaginatedData<T>> - The last page (not wrapped in FinaticResponse)
   * @throws Error if fetch fails
   */
  async lastPage(): Promise<PaginatedData<T>> {
    // Iterative approach to find last page
    let currentOffset = this.meta.current_offset;
    let lastValidData: PaginatedData<T> | null = null;

    while (true) {
      const testParams = { ...this.currentParams, offset: currentOffset };
      const response = await this.originalMethod.call(
        this.wrapperInstance,
        testParams
      );
      if (!response.success) {
        break;
      }
      lastValidData = response.success.data as PaginatedData<T>;
      if (!lastValidData || !lastValidData.hasMore) {
        break;
      }
      currentOffset += this.meta.limit;
    }

    if (!lastValidData) {
      throw new Error('Failed to fetch last page');
    }

    return lastValidData; // Return PaginatedData directly
  }
}

