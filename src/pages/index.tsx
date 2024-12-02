import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import QRCode from "react-qr-code";
import { Proof, ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { useState } from 'react';
import { toast } from 'react-toastify';
const APP_ID = "0x486dD3B9C8DF7c9b263C75713c79EC1cf8F592F2";
const APP_SECRET = "0x1f86678fe5ec8c093e8647d5eb72a65b5b2affb7ee12b70f74e519a77b295887";
const PROVIDER_ID = "952816de-91e4-4ca8-9c84-3a9df405a277";

export default function Home() {
  const [url, setUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [step, setStep] = useState("input");

  const getVerificationReq = async () => {
    setStep("scan");
    try {
      const reclaimClient = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        PROVIDER_ID,
        { log: false, acceptAiProviders: true }
      );
      setQrUrl(await reclaimClient.getRequestUrl());
      console.log(await reclaimClient.getStatusUrl());
      await reclaimClient.startSession({
        onSuccess: async (proof) => {
          console.log("Verification success", (proof as Proof).claimData.context.includes(url));
          if ((proof as Proof).claimData.context.includes(url))
            toast.success("You have successfully claimed that you're the owner of the paper.");
          else
            toast.error("You're not the owner of the paper.");
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
            {qrUrl.length > 0 ? (
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
            )}
          </>
        )}
      </Box>
    </Box>
  );
} 