import { Locator, expect } from '@playwright/test'
import { logger } from '../../utils/logger'

/**
 * Shared wrapper for HTML tables. Columns are found by their header text, so tests keep working
 * when a column is added or moved. Pass the `<table>` element as `root`.
 */
export class BaseTable {
  private readonly rows: Locator
  private readonly headerCells: Locator

  constructor(protected readonly root: Locator) {
    this.rows = root.locator('tbody tr')
    this.headerCells = root.locator('thead th')
  }

  /** Header texts in column order, e.g. `['Pic', 'Title', 'Price', 'x']`. */
  async getHeaders(): Promise<string[]> {
    const headers = await this.headerCells.allTextContents()
    return headers.map((text) => text.trim())
  }

  /** Text of every body cell in the column with this header, top to bottom. */
  async getColumnValues(header: string): Promise<string[]> {
    const index = await this.columnIndex(header)
    const cells = await this.rows.locator(`td:nth-child(${index + 1})`).allTextContents()
    return cells.map((text) => text.trim())
  }

  async getRows(headers: string[]): Promise<Record<string, string>[]> {
    const columns = await Promise.all(headers.map((header) => this.getColumnValues(header)))
    const rowCount = columns[0]?.length ?? 0
    return Array.from({ length: rowCount }, (_, row) =>
      Object.fromEntries(headers.map((header, col) => [header, columns[col][row]])),
    )
  }

  /** Rows load incrementally, so wait for the exact count rather than the first response. */
  async expectRowCount(expectedCount: number, timeout: number = 10000): Promise<void> {
    await expect(this.rows, `Expect table to show ${expectedCount} row(s)`).toHaveCount(
      expectedCount,
      { timeout },
    )
    logger.step(`Wait for table to show ${expectedCount} row(s) successfully`)
  }

  private async columnIndex(header: string): Promise<number> {
    const headers = await this.getHeaders()
    const index = headers.indexOf(header)
    if (index === -1) {
      throw new Error(`Column "${header}" not found. Headers: ${headers.join(', ')}`)
    }
    return index
  }
}
