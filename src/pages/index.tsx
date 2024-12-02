import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import QRCode from "react-qr-code";
import { Proof, ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { useState } from 'react';
import { toast } from 'react-toastify';
const APP_ID = "0x486dD3B9C8DF7c9b263C75713c79EC1cf8F592F2";
const APP_SECRET = "0x1f86678fe5ec8c093e8647d5eb72a65b5b2affb7ee12b70f74e519a77b295887";
const PROVIDER_ID = "952816de-91e4-4ca8-9c84-3a9df405a277";

// Add new interface for parsed paper data
interface ArxivPaper {
  title: string;
  url: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [step, setStep] = useState("input");
  const [papers, setPapers] = useState<ArxivPaper[]>([]);


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

  const getVerificationReq = async () => {
    setStep("scan");
    try {
      const reclaimClient = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        PROVIDER_ID,
        { log: false, acceptAiProviders: true }
      );
      const requestUrl = await reclaimClient.getRequestUrl();
      const statusUrl = await reclaimClient.getStatusUrl();
      console.log("requestUrl", requestUrl);
      console.log("statusUrl", statusUrl);
      setQrUrl(requestUrl);
      await reclaimClient.startSession({
        onSuccess: async (proof) => {
          const htmlContent = (proof as Proof).claimData.parameters;
          const extractedPapers = parseArxivHtml(htmlContent);
          setPapers(extractedPapers);
          
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
      console.error("Error in getVerificationReq", error);
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
              onClick={getVerificationReq}
              sx={{
                marginTop: 2,
                bgcolor: '#4a90e2',
                '&:hover': {
                  bgcolor: '#357abd',
                },
              }}
            >
              Next
            </Button>
          </>
        ) : (
          <>
            {papers.length > 0 ? (
              <Box sx={{ marginTop: 4, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Extracted Papers:
                </Typography>
                <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: '1px solid white', padding: '8px' }}>Title</th>
                      <th style={{ borderBottom: '1px solid white', padding: '8px' }}>URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {papers.map((paper, index) => (
                      <tr key={index} style={{ fontWeight: paper.url === url ? 'bold' : 'normal' }}>
                        <td style={{ borderBottom: '1px solid white', padding: '8px' }}>{paper.title}</td>
                        <td style={{ borderBottom: '1px solid white', padding: '8px' }}>
                          <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                            {paper.url}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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