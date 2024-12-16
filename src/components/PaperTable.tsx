import { Box, Typography } from '@mui/material';
import { ArxivPaper, SciencePaper, GoogleScholarPaper } from '../types/papers';

interface PaperTableProps {
  papers: ArxivPaper[] | SciencePaper[] | GoogleScholarPaper[];
  platform: "arxiv" | "science" | "googleScholar" | null;
  url: string;
}

export const PaperTable = ({ papers, platform, url }: PaperTableProps) => {
  return (
    <Box sx={{ marginTop: 4, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Extracted Papers:
      </Typography>
      {platform === "arxiv" ? (
        <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>ID</th>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Title</th>
            </tr>
          </thead>
          <tbody>
            {(papers as ArxivPaper[]).map((paper, index) => (
              <tr key={index} style={{ fontWeight: paper.url === url ? 'bold' : 'normal' }}>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                    {paper.url.match(/\d+\.\d+/)?.[0] || 'N/A'}
                  </a>
                </td>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : platform === "science" ? (
        <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Manuscript Number</th>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Title</th>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>First Author</th>
            </tr>
          </thead>
          <tbody>
            {(papers as SciencePaper[]).map((paper, index) => (
              <tr key={index} style={{ fontWeight: paper.articleUUID === url.split('/').pop() ? 'bold' : 'normal' }}>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.manuscriptNumber}</td>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.title}</td>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.firstAuthor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : platform === "googleScholar" ? (
        <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Title</th>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Authors</th>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Year</th>
              <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Citations</th>
            </tr>
          </thead>
          <tbody>
            {(papers as GoogleScholarPaper[]).map((paper, index) => (
              <tr key={index} style={{ fontWeight: paper.url === url ? 'bold' : 'normal' }}>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                    {paper.title}
                  </a>
                </td>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.authors}</td>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.year}</td>
                <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.citations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Box>
  );
}; 