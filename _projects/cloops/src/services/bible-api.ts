import { getEnv } from '../utils/env.js';

const BASE_URL = 'https://rest.api.bible/v1';

interface BibleSummary {
  id: string;
  name: string;
  abbreviation: string;
  language: {
    id: string;
    name: string;
  };
}

interface Book {
  id: string;
  name: string;
  abbreviation: string;
}

interface Chapter {
  id: string;
  number: string;
  reference: string;
}

interface Section {
  id: string;
  title: string;
  content?: string;
}

interface SectionDetail {
  id: string;
  title: string;
  content: string;
  verseCount: number;
  reference: string;
}

export interface BibleApiService {
  listBibles(): Promise<BibleSummary[]>;
  getBooks(bibleId: string): Promise<Book[]>;
  getChapters(bibleId: string, bookId: string): Promise<Chapter[]>;
  getSections(bibleId: string, chapterId: string): Promise<Section[]>;
  getSection(bibleId: string, sectionId: string): Promise<SectionDetail>;
  getChapterContent(bibleId: string, chapterId: string): Promise<string>;
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const env = getEnv();
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'api-key': env.BIBLE_API_KEY,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bible API error (${response.status}): ${text}`);
  }

  const json = await response.json();
  return json.data;
}

async function listBibles(): Promise<BibleSummary[]> {
  return apiFetch<BibleSummary[]>('/bibles?language=eng');
}

async function getBooks(bibleId: string): Promise<Book[]> {
  return apiFetch<Book[]>(`/bibles/${bibleId}/books`);
}

async function getChapters(bibleId: string, bookId: string): Promise<Chapter[]> {
  return apiFetch<Chapter[]>(`/bibles/${bibleId}/books/${bookId}/chapters`);
}

async function getSections(bibleId: string, chapterId: string): Promise<Section[]> {
  return apiFetch<Section[]>(`/bibles/${bibleId}/chapters/${chapterId}/sections`);
}

async function getSection(bibleId: string, sectionId: string): Promise<SectionDetail> {
  // Get plain text content without notes or verse numbers for cleaner extraction
  const params = 'content-type=text&include-notes=false&include-titles=true&include-verse-numbers=false';
  return apiFetch<SectionDetail>(`/bibles/${bibleId}/sections/${sectionId}?${params}`);
}

async function getChapterContent(bibleId: string, chapterId: string): Promise<string> {
  // Fallback: get full chapter content if sections aren't available
  const params = 'content-type=text&include-notes=false&include-titles=true&include-verse-numbers=false';
  interface ChapterContent {
    content: string;
  }
  const data = await apiFetch<ChapterContent>(`/bibles/${bibleId}/chapters/${chapterId}?${params}`);
  return data.content;
}

export function createBibleApiService(): BibleApiService {
  return {
    listBibles,
    getBooks,
    getChapters,
    getSections,
    getSection,
    getChapterContent,
  };
}

// Export types for use in other modules
export type { BibleSummary, Book, Chapter, Section, SectionDetail };
