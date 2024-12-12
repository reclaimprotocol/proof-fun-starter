# Academic Paper Verification Platform

A web application that verifies academic paper authorship using Zero Knowledge Proofs through the Reclaim Protocol. Currently supports paper verification from Arxiv and Science.org.

## 🚀 Features

- Zero Knowledge Proof-based verification
- Support for multiple academic platforms:
  - Arxiv
  - Science.org
- QR code-based mobile verification
- Real-time proof validation
- Secure paper ownership verification

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- [Reclaim Wallet App](https://reclaimprotocol.org/) installed on your mobile device


## 🔧 Configuration

### Provider IDs
The application requires APP_ID, APP_SECRET for authentication, and platform-specific Provider IDs.
You can obtain these credentials from the [Reclaim Protocol Dashboard](https://dev.reclaimprotocol.org/).
(Note: While this starter project includes environment values directly in the code for demonstration purposes,
it is strongly recommended to use secure environment variables in production environments.)
```
const APP_ID = "0x486dD3B9C8DF7c9b263C75713c79EC1cf8F592F2";
const APP_SECRET = "0x1f86678fe5ec8c093e8647d5eb72a65b5b2affb7ee12b70f74e519a77b295887";
const ARXIV_PROVIDER_ID = "952816de-91e4-4ca8-9c84-3a9df405a277"
const SCIENCE_PROVIDER_ID = "82d2434e-de91-4d91-820d-bb71c66f52dc"
```


## 📖 How It Works

### 1. User Input
Users start by entering their paper's URL and selecting their platform (Arxiv or Science). The application maintains state using React hooks:

```typescript
const [url, setUrl] = useState("");
const [platform, setPlatform] = useState<"arxiv" | "science" | null>(null);
```

### 2. Verification Process

#### a. Initialization
When a platform is selected, the application initializes the Reclaim client:

```typescript
const reclaimClient = await ReclaimProofRequest.init(
  process.env.NEXT_PUBLIC_APP_ID!,
  process.env.APP_SECRET!,
  platform === "arxiv" 
    ? process.env.NEXT_PUBLIC_ARXIV_PROVIDER_ID! 
    : process.env.NEXT_PUBLIC_SCIENCE_PROVIDER_ID!,
  { log: false, acceptAiProviders: true }
);
```

#### b. QR Code Generation
A QR code is generated containing the verification request URL:

```typescript
const requestUrl = await reclaimClient.getRequestUrl();
<QRCode value={requestUrl} size={200} />
```

#### c. Session Handling
The application starts a verification session and handles success/error cases:

```typescript
await reclaimClient.startSession({
  onSuccess: async (proof) => {
    const htmlContent = (proof as Proof).claimData.parameters;
    const extractedPapers = platform === "arxiv" 
      ? parseArxivHtml(htmlContent)
      : parseScienceHtml(htmlContent);
    
    // Verify paper ownership
    const isPaperOwner = verifyOwnership(extractedPapers, url);
    if (isPaperOwner) {
      toast.success("Verification successful!");
    }
  },
  onError: (error) => {
    toast.error("Verification failed");
  },
});
```

### 3. Paper Data Processing

#### For Arxiv Papers
Papers are extracted from HTML content and structured:

```typescript
interface ArxivPaper {
  title: string;
  url: string;
}

const parseArxivHtml = (htmlString: string) => {
  const parsedData = JSON.parse(htmlString);
  const doc = parser.parseFromString(parsedData.paramValues.allrows, 'text/html');
  // Extract paper details from links matching arxiv pattern
  return papers.map(link => ({
    title: link.innerText,
    url: link.href
  }));
};
```

#### For Science Papers
Science.org papers include additional metadata:

```typescript
interface SciencePaper {
  articleUUID: string;
  manuscriptNumber: string;
  title: string;
  firstAuthor: string;
  // ... other fields
}

const parseScienceHtml = (jsonString: string) => {
  const parsedData = JSON.parse(jsonString);
  return JSON.parse(parsedData.paramValues.allarticles);
};
```

### 4. Display Results
Results are displayed in a formatted table based on the platform:

```typescript
{platform === "arxiv" ? (
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
      </tr>
    </thead>
    <tbody>
      {papers.map(paper => (
        <tr key={paper.url}>
          <td>{paper.url.match(/\d+\.\d+/)?.[0]}</td>
          <td>{paper.title}</td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  // Similar structure for Science papers
)}
```

### 5. Security Considerations
- All sensitive credentials are stored in environment variables
- Paper ownership verification is done server-side
- Zero-knowledge proofs ensure user privacy
- QR codes are generated uniquely for each session

---

For more details, check out the [Reclaim Protocol Documentation](https://docs.reclaimprotocol.org/)

---

Built with ❤️ using Next.js, Material-UI, and Reclaim Protocol