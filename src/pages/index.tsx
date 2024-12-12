import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import QRCode from "react-qr-code";
import { Proof, ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { useState } from 'react';
import { toast } from 'react-toastify';
const APP_ID = "0x486dD3B9C8DF7c9b263C75713c79EC1cf8F592F2";
const APP_SECRET = "0x1f86678fe5ec8c093e8647d5eb72a65b5b2affb7ee12b70f74e519a77b295887";
const ARXIV_PROVIDER_ID = "952816de-91e4-4ca8-9c84-3a9df405a277";
const SCIENCE_PROVIDER_ID = "82d2434e-de91-4d91-820d-bb71c66f52dc";

// Add new interface for parsed paper data
interface ArxivPaper {
  title: string;
  url: string;
}

interface SciencePaper {
  articleUUID: string;
  manuscriptNumber: string;
  title: string;
  firstAuthor: string;
  correspondingAuthor: string;
  publicationName: string;
  status: string;
  receivedDate: number;
  publishedDate: number | string; // Since publishedDate can be an empty string
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [step, setStep] = useState("input");
  const [papers, setPapers] = useState<ArxivPaper[] | SciencePaper[]>([]);
  const [platform, setPlatform] = useState<"arxiv" | "science" | null>(null);


  const parseArxivHtml = (htmlString: string) => {
    try {
      // Parse the JSON string to get the HTML content
      const parsedData = JSON.parse(htmlString);
      const allRowsHtml = parsedData.paramValues.allrows;

      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(allRowsHtml, 'text/html');

      // Find all groups of 5 consecutive td.tbbod elements (each paper row)
      const papers: ArxivPaper[] = [];
      const cells = doc.querySelectorAll('a');
      console.log(doc);
      console.log(cells);
      // Filter links that match arxiv paper pattern
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

  const parseScienceHtml = (jsonString: string) => {
    try {
      console.log(jsonString);
      const parsedData = JSON.parse(jsonString);
      const articles = JSON.parse(parsedData.paramValues.allarticles);
      
      return articles;
    } catch (error) {
      console.error('Error parsing Science HTML:', error);
      return [];
    }
  };

  const getVerificationReqForAxiv = async () => {
    setStep("scan");
    setPlatform("arxiv");
    try {
      // Initialize the Reclaim client for ArXiv
      // To get the APP_ID and APP_SECRET, you need to create a new app in the Reclaim dashboard
      // The Arxiv Provider Id is in the 'Explore Providers' section of the dashboard
      const reclaimClient = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        ARXIV_PROVIDER_ID,
        { log: false, acceptAiProviders: true }
      );

      // The requestUrl is the URL that the user needs to visit(through the QR code) to start the verification process
      const requestUrl = await reclaimClient.getRequestUrl();
      console.log("requestUrl", requestUrl);
      // The statusUrl is the URL that the user can visit to check the status of the verification process
      const statusUrl = await reclaimClient.getStatusUrl();
      console.log("statusUrl", statusUrl);
      // Set the QR code URL to the requestUrl
      setQrUrl(requestUrl);
      // Start the verification process
      await reclaimClient.startSession({
        onSuccess: async (proof) => {
          // The proof is the proof that the user has successfully generated in the Verifier app
          const htmlContent = (proof as Proof).claimData.parameters;
          // Parse the HTML content to get the papers
          const extractedPapers = parseArxivHtml(htmlContent);
          // Set the papers to the extracted papers
          setPapers(extractedPapers);
          
          // Check if the user is the owner of the paper
          const isPaperOwner = extractedPapers.some(paper => paper.url === url);
          console.log(extractedPapers, isPaperOwner);
          if (isPaperOwner) {
            toast.success("You have successfully claimed that you're the owner of the paper.");
          } else {
            toast.error("You're not the owner of the paper.");
          }
        },
        onError: (error) => {
          toast.error("Verification failed");
          console.log("error", error);
        },
      });
    } catch (error) {
      console.error("Error in getVerificationReqForAxiv", error);
    }
  };


  const getVerificationReqForScience = async () => {
    setStep("scan");
    setPlatform("science");
    try {
      // Initialize the Reclaim client for Science
      // The Science Provider Id is in the 'Explore Providers' section of the dashboard
      const reclaimClient = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        SCIENCE_PROVIDER_ID, // Notice the change in provider id.
        { log: false, acceptAiProviders: true }
      );
      // The requestUrl is the URL that the user needs to visit(through the QR code) to start the verification process
      const requestUrl = await reclaimClient.getRequestUrl();
      // The statusUrl is the URL that the user can visit to check the status of the verification process
      const statusUrl = await reclaimClient.getStatusUrl();
      console.log("requestUrl", requestUrl);
      console.log("statusUrl", statusUrl);
      // Set the QR code URL to the requestUrl
      setQrUrl(requestUrl);
      // Start the verification process
      await reclaimClient.startSession({
        onSuccess: async (proof) => {
          // The proof is the proof that the user has successfully generated in the Verifier app
          const htmlContent = (proof as Proof).claimData.parameters;
          // Parse the HTML content to get the papers
          const extractedPapers = parseScienceHtml(htmlContent);
          // Set the papers to the extracted papers
          setPapers(extractedPapers);
          
          // Check if the user is the owner of the paper
          const isPaperOwner = extractedPapers.some((paper: SciencePaper) => paper.articleUUID === url.split('/').pop());
          console.log(extractedPapers, isPaperOwner);
          if (isPaperOwner) {
            toast.success("You have successfully claimed that you're the owner of the paper.");
          } else {
            toast.error("You're not the owner of the paper.");
          }
        },
        onError: (error) => {
          toast.error("Verification failed");
          console.log("error", error);
        },
      });
    } catch (error) {
      console.error("Error in getVerificationReqForAxiv", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#1a1a1a',
        color: 'white',
        padding: '20px',
      }}
    >
      <Box
        sx={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {step === "input" ? (
          <>
            <Typography variant="h5" gutterBottom>
              Enter the Paper URL:
            </Typography>
            <TextField
              fullWidth
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              sx={{
                marginY: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={getVerificationReqForAxiv}
              sx={{
                marginTop: 2,
                bgcolor: '#4a90e2',
                '&:hover': {
                  bgcolor: '#357abd',
                },
              }}
            >
              Arxiv
            </Button>

            <Button
              variant="contained"
              onClick={getVerificationReqForScience}
              sx={{
                marginTop: 2,
                marginLeft: 2,
                bgcolor: '#4a90e2',
                '&:hover': {
                  bgcolor: '#357abd',
                },
              }}
            >
              Science
            </Button>
          </>
        ) : (
          <>
            {papers.length > 0 ? (
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
                ) : (
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
                )}
              </Box>
            ) : (
              qrUrl.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h5" gutterBottom>
                    Please scan the QR code using your mobile device
                  </Typography>
                  <QRCode value={qrUrl} size={200} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              )
            )}
          </>
        )}
      </Box>
    </Box>
  );
} 