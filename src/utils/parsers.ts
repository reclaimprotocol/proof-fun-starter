import { ArxivPaper, SciencePaper, GoogleScholarPaper } from '../types/papers';

export const parseArxivHtml = (htmlString: string): ArxivPaper[] => {
  try {
    const parsedData = JSON.parse(htmlString);
    const allRowsHtml = parsedData.paramValues.allrows;
    const parser = new DOMParser();
    const doc = parser.parseFromString(allRowsHtml, 'text/html');
    const papers: ArxivPaper[] = [];
    const cells = doc.querySelectorAll('a');
    
    const paperLinks = Array.from(cells).filter(link => {
      return link.href.match(/https:\/\/arxiv\.org\/abs\/\d+\.\d+/) && !link.innerHTML.match(/[0-9]+\.[0-9]+/);
    });
    
    paperLinks.forEach(link => {
      papers.push({
        title: link.innerText || '',
        url: link.href
      });
    });

    return papers;
  } catch (error) {
    console.error('Error parsing ArXiv HTML:', error);
    return [];
  }
};

export const parseScienceHtml = (jsonString: string): SciencePaper[] => {
  try {
    const parsedData = JSON.parse(jsonString);
    const articles = JSON.parse(parsedData.paramValues.allarticles);
    return articles;
  } catch (error) {
    console.error('Error parsing Science HTML:', error);
    return [];
  }
};

export const parseGoogleScholarHtml = (htmlString: string): GoogleScholarPaper[] => {
  try {
    const parsedData = JSON.parse(htmlString);
    const allRowsHtml = parsedData.paramValues.allrows;
    console.log("allRowsHtml", allRowsHtml);
    const parser = new DOMParser();
    const doc = parser.parseFromString(allRowsHtml, 'text/html');
    console.log("doc", doc);
    const papers: GoogleScholarPaper[] = [];
    
    // Get the paper title
    const titleElement = doc.querySelector('a.gsc_a_at');
    const authorsElement = doc.querySelector('.gs_gray');
    const publicationElement = doc.querySelector('.gs_gray:nth-child(2)');
    const citationsElement = doc.querySelector('a.gsc_a_ac');
    const yearElement = doc.querySelector('.gsc_a_h.gsc_a_hc.gs_ibl');

    if (titleElement) {
      const paper: GoogleScholarPaper = {
        title: titleElement.textContent || '',
        authors: authorsElement?.textContent?.trim() || '',
        publication: publicationElement?.textContent?.trim() || '',
        citations: parseInt(citationsElement?.textContent || '0', 10),
        year: parseInt(yearElement?.textContent || '0', 10),
        url: `https://scholar.google.com${(titleElement as HTMLAnchorElement).getAttribute('href') || ''}`
      };
      papers.push(paper);
    }
    console.log("papers", papers);
    return papers;
  } catch (error) {
    console.error('Error parsing Google Scholar HTML:', error);
    return [];
  }
}; 