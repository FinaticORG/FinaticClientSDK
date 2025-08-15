/**
 * Pagination-related types and classes
 */

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
      console.error('Error fetching next page:', error);
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
      console.error('Error fetching previous page:', error);
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
      console.error('Error fetching page:', pageNumber, error);
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
      console.error('Error fetching first page:', error);
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
      console.error('Error fetching last page:', error);
      return null;
    }
  }

  getPaginationInfo(): string {
    return `Page ${this.currentPage} (${this.metadata.currentOffset + 1}-${this.metadata.currentOffset + this.metadata.limit})`;
  }
} 