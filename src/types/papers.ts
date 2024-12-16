export interface ArxivPaper {
  title: string;
  url: string;
}

export interface SciencePaper {
  articleUUID: string;
  manuscriptNumber: string;
  title: string;
  firstAuthor: string;
  correspondingAuthor: string;
  publicationName: string;
  status: string;
  receivedDate: number;
  publishedDate: number | string;
}

export interface GoogleScholarPaper {
    title: string;
    authors: string;
    publication: string;
    citations: number;
    year: number;
    url: string;
  }