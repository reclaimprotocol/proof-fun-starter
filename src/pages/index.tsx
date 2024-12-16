import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import QRCode from "react-qr-code";
import { useState } from 'react';
import { getVerificationReqForAxiv, getVerificationReqForScience, getVerificationReqForGoogleScholar } from '../utils/verification';
import { PaperTable } from '../components/PaperTable';
import { ArxivPaper, SciencePaper } from '../types/papers';

export default function Home() {
  const [url, setUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [step, setStep] = useState("input");
  const [papers, setPapers] = useState<ArxivPaper[] | SciencePaper[]>([]);
  const [platform, setPlatform] = useState<"arxiv" | "science" | "googleScholar" | null>(null);

  const callbacks = {
    setStep,
    setPlatform,
    setQrUrl,
    setPapers,
    url
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
              onClick={() => getVerificationReqForAxiv(callbacks)}
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
              onClick={() => getVerificationReqForScience(callbacks)}
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

            <Button
              variant="contained"
              onClick={() => getVerificationReqForGoogleScholar(callbacks)}
              sx={{
                marginTop: 2, 
                marginLeft: 2,
                bgcolor: '#4a90e2',
                '&:hover': {
                  bgcolor: '#357abd',
                },
              }}
            >
              Google Scholar
            </Button>
          </>
        ) : (
          <>
            {papers.length > 0 ? (
              <PaperTable papers={papers} platform={platform} url={url} />
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