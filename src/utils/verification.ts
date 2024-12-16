import { ReclaimProofRequest, Proof } from "@reclaimprotocol/js-sdk";
import { toast } from 'react-toastify';
import { APP_ID, APP_SECRET, ARXIV_PROVIDER_ID, SCIENCE_PROVIDER_ID, GOOGLE_SCHOLAR_PROVIDER_ID } from '../constants/config';
import { parseArxivHtml, parseScienceHtml, parseGoogleScholarHtml } from './parsers';
import { ArxivPaper, SciencePaper, GoogleScholarPaper } from '../types/papers';

interface VerificationCallbacks {
  setStep: (step: string) => void;
  setPlatform: (platform: "arxiv" | "science" | "googleScholar" | null) => void;
  setQrUrl: (url: string) => void;
  setPapers: (papers: ArxivPaper[] | SciencePaper[] | GoogleScholarPaper[]) => void;
  url: string;
}

export const getVerificationReqForAxiv = async (callbacks: VerificationCallbacks) => {
  const { setStep, setPlatform, setQrUrl, setPapers, url } = callbacks;
  setStep("scan");
  setPlatform("arxiv");
  try {
    const reclaimClient = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      ARXIV_PROVIDER_ID,
      { log: false, acceptAiProviders: true }
    );

    const requestUrl = await reclaimClient.getRequestUrl();
    console.log("requestUrl", requestUrl);
    setQrUrl(requestUrl);

    await reclaimClient.startSession({
      onSuccess: async (proof) => {
        const htmlContent = (proof as Proof).claimData.parameters;
        const extractedPapers = parseArxivHtml(htmlContent);
        setPapers(extractedPapers);
        
        const isPaperOwner = extractedPapers.some(paper => paper.url === url);
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

export const getVerificationReqForScience = async (callbacks: VerificationCallbacks) => {
  // Similar implementation as getVerificationReqForAxiv but for Science
  // ... (implementation similar to the original but using the callbacks)
  const { setStep, setPlatform, setQrUrl, setPapers, url } = callbacks;
  
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

export const getVerificationReqForGoogleScholar = async (callbacks: VerificationCallbacks) => {
    // Similar implementation as getVerificationReqForAxiv but for Science
    // ... (implementation similar to the original but using the callbacks)
    const { setStep, setPlatform, setQrUrl, setPapers, url } = callbacks;
    
    setStep("scan");
    setPlatform("googleScholar");
    try {
      // Initialize the Reclaim client for Science
      // The Science Provider Id is in the 'Explore Providers' section of the dashboard
      const reclaimClient = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        GOOGLE_SCHOLAR_PROVIDER_ID, // Notice the change in provider id.
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
          const extractedPapers = parseGoogleScholarHtml(htmlContent);
          // Set the papers to the extracted papers
          setPapers(extractedPapers);
          
          // Check if the user is the owner of the paper
          const isPaperOwner = extractedPapers.some((paper: GoogleScholarPaper) => paper.url === url);
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
  