/**
 * Pagination-related types and classes
 */

import { setupLogger, buildLoggerExtra, LoggerExtra } from '../../lib/logger';

const paginationLogger = setupLogger('FinaticClientSDK.Pagination', undefined, {
  codebase: 'FinaticClientSDK',
});

const buildPaginationExtra = (functionName: string, metadata?: Record<string, unknown>): LoggerExtra => ({
  module: 'PaginatedResult',
  function: functionName,
  ...(metadata ? buildLoggerExtra(metadata) : {}),
});

export interface ApiPaginationInfo {
  has_more: boolean;
  next_offset: number;
  current_offset: number;
  limit: number;
}

export interface PaginationMetadata {
  hasMore: boolean;
  nextOffset: number;
  currentOffset: number;
  limit: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class PaginatedResult<T> {
  public readonly data: T;
  public readonly metadata: PaginationMetadata;
  private navigationCallback?: (offset: number, limit: number) => Promise<PaginatedResult<T>>;

  constructor(
    data: T,
    paginationInfo: ApiPaginationInfo,
    navigationCallback?: (offset: number, limit: number) => Promise<PaginatedResult<T>>
  ) {
    this.data = data;
    this.navigationCallback = navigationCallback;
    this.metadata = {
      hasMore: paginationInfo.has_more,
      nextOffset: paginationInfo.next_offset,
      currentOffset: paginationInfo.current_offset,
      limit: paginationInfo.limit,
      currentPage: Math.floor(paginationInfo.current_offset / paginationInfo.limit) + 1,
      hasNext: paginationInfo.has_more,
      hasPrevious: paginationInfo.current_offset > 0,
    };
  }

  get hasNext(): boolean {
    return this.metadata.hasNext;
  }

  get hasPrevious(): boolean {
    return this.metadata.hasPrevious;
  }

  get currentPage(): number {
    return this.metadata.currentPage;
  }

  async nextPage(): Promise<PaginatedResult<T> | null> {
    if (!this.hasNext || !this.navigationCallback) {
      return null;
    }

    try {
      return await this.navigationCallback(this.metadata.nextOffset, this.metadata.limit);
    } catch (error) {
      paginationLogger.exception('Error fetching next page', error, buildPaginationExtra('nextPage', {
        next_offset: this.metadata.nextOffset,
        limit: this.metadata.limit,
      }));
      return null;
    }
  }

  async previousPage(): Promise<PaginatedResult<T> | null> {
    if (!this.hasPrevious || !this.navigationCallback) {
      return null;
    }

    const previousOffset = Math.max(0, this.metadata.currentOffset - this.metadata.limit);
    try {
      return await this.navigationCallback(previousOffset, this.metadata.limit);
    } catch (error) {
      paginationLogger.exception('Error fetching previous page', error, buildPaginationExtra('previousPage', {
        previous_offset: previousOffset,
        limit: this.metadata.limit,
      }));
      return null;
    }
  }

  async goToPage(pageNumber: number): Promise<PaginatedResult<T> | null> {
    if (!this.navigationCallback || pageNumber < 1) {
      return null;
    }

    const offset = (pageNumber - 1) * this.metadata.limit;
    try {
      return await this.navigationCallback(offset, this.metadata.limit);
    } catch (error) {
      paginationLogger.exception('Error fetching page', error, buildPaginationExtra('goToPage', {
        page_number: pageNumber,
        offset,
        limit: this.metadata.limit,
      }));
      return null;
    }
  }

  async firstPage(): Promise<PaginatedResult<T> | null> {
    if (!this.navigationCallback) {
      return null;
    }

    try {
      return await this.navigationCallback(0, this.metadata.limit);
    } catch (error) {
      paginationLogger.exception('Error fetching first page', error, buildPaginationExtra('firstPage', {
        limit: this.metadata.limit,
      }));
      return null;
    }
  }

  async lastPage(): Promise<PaginatedResult<T> | null> {
    if (!this.navigationCallback) {
      return null;
    }

    const findLast = async (page: PaginatedResult<T>): Promise<PaginatedResult<T>> => {
      if (!page.hasNext) {
        return page;
      }
      const nextPage = await page.nextPage();
      if (!nextPage) {
        return page;
      }
      return findLast(nextPage);
    };

    try {
      return await findLast(this);
    } catch (error) {
      paginationLogger.exception('Error fetching last page', error, buildPaginationExtra('lastPage', {
        limit: this.metadata.limit,
      }));
      return null;
    }
  }

  getPaginationInfo(): string {
    return `Page ${this.currentPage} (${this.metadata.currentOffset + 1}-${this.metadata.currentOffset + this.metadata.limit})`;
  }
} 