/**
 * Data Processor
 * CSV parsing and category extraction
 */

import * as fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { ProblemCategory } from '../types/script.types';
import { CSVReadError, CSVParseError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * CSV Row interface matching the input file structure
 */
interface CSVRow {
  denomination: string;
  onboardingV7_lifeChallenge: string;
  age: string;
  gender: string;
  lifeChallengeOption: string;
}

/**
 * DataProcessor class for CSV operations
 */
export class DataProcessor {
  constructor(private csvPath: string) {}

  /**
   * Extract unique problem categories from CSV
   */
  async extractCategories(filterList?: string[] | "all"): Promise<ProblemCategory[]> {
    try {
      logger.debug(`Reading CSV from: ${this.csvPath}`);

      // Read CSV file
      const fileContent = await this.readCSV();

      // Parse CSV
      const rows = this.parseCSV(fileContent);

      logger.info(`Parsed ${rows.length} rows from CSV`);

      // Extract unique categories
      const uniqueCategories = this.extractUniqueCategories(rows);

      logger.info(`Found ${uniqueCategories.size} unique categories`);
      uniqueCategories.forEach(cat => logger.debug(`  - ${cat}`));

      // Filter categories if needed
      const filteredCategories = this.filterCategories(
        Array.from(uniqueCategories),
        filterList
      );

      logger.info(`Using ${filteredCategories.length} categories for generation`);

      return filteredCategories;
    } catch (error) {
      if (error instanceof CSVReadError || error instanceof CSVParseError) {
        throw error;
      }
      throw new CSVReadError(
        `Failed to extract categories: ${error instanceof Error ? error.message : String(error)}`,
        { csvPath: this.csvPath }
      );
    }
  }

  /**
   * Read CSV file from disk
   */
  private async readCSV(): Promise<string> {
    try {
      const content = await fs.readFile(this.csvPath, 'utf-8');
      if (!content || content.trim().length === 0) {
        throw new CSVReadError('CSV file is empty', { csvPath: this.csvPath });
      }
      return content;
    } catch (error) {
      if (error instanceof CSVReadError) {
        throw error;
      }
      throw new CSVReadError(
        `Failed to read CSV file: ${error instanceof Error ? error.message : String(error)}`,
        { csvPath: this.csvPath }
      );
    }
  }

  /**
   * Parse CSV content into rows
   */
  private parseCSV(content: string): CSVRow[] {
    try {
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
      });

      if (!Array.isArray(records) || records.length === 0) {
        throw new CSVParseError('No valid rows found in CSV', { rowCount: 0 });
      }

      return records as CSVRow[];
    } catch (error) {
      throw new CSVParseError(
        `Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`,
        { csvPath: this.csvPath }
      );
    }
  }

  /**
   * Extract unique categories from rows
   */
  private extractUniqueCategories(rows: CSVRow[]): Set<ProblemCategory> {
    const categories = new Set<ProblemCategory>();

    for (const row of rows) {
      if (row.lifeChallengeOption) {
        // Clean up the category string (remove extra quotes)
        const cleaned = row.lifeChallengeOption
          .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
          .trim();

        if (cleaned && this.isValidCategory(cleaned)) {
          categories.add(cleaned as ProblemCategory);
        }
      }
    }

    return categories;
  }

  /**
   * Check if a string is a valid problem category
   */
  private isValidCategory(category: string): boolean {
    const validCategories: ProblemCategory[] = [
      "Anxiety or fear",
      "Stress or burnout",
      "Finances or provision",
      "Purpose or direction",
      "Loneliness or heartbreak",
      "Family or relationships",
      "Addiction or temptation",
      "Health or healing",
      "Grief or loss"
    ];

    return validCategories.includes(category as ProblemCategory);
  }

  /**
   * Filter categories based on configuration
   */
  private filterCategories(
    categories: ProblemCategory[],
    filterList?: string[] | "all"
  ): ProblemCategory[] {
    // If no filter or "all", return all categories
    if (!filterList || filterList === "all") {
      return categories;
    }

    // Filter to only include categories in the filter list
    const filtered = categories.filter(cat => filterList.includes(cat));

    if (filtered.length === 0) {
      logger.warn('No categories matched the filter list');
    }

    return filtered;
  }

  /**
   * Validate CSV structure
   */
  async validateCSV(): Promise<boolean> {
    try {
      const content = await this.readCSV();
      const rows = this.parseCSV(content);

      // Check required columns
      const requiredColumns = ['lifeChallengeOption'];
      const firstRow = rows[0];

      for (const col of requiredColumns) {
        if (!(col in firstRow)) {
          throw new CSVParseError(
            `Missing required column: ${col}`,
            { requiredColumns, availableColumns: Object.keys(firstRow) }
          );
        }
      }

      logger.info('CSV validation passed');
      return true;
    } catch (error) {
      logger.error('CSV validation failed:', error);
      return false;
    }
  }
}
