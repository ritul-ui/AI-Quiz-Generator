import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

const GEMINI_API_KEY =  import.meta.env.VITE_API_KEY as string;
// console.log("GEMINI_API_KEY:", GEMINI_API_KEY);

function App() {
  const [article, setArticle] = useState("");
  const [summary, setSummary] = useState("");
  const [mcqs, setMcqs] = useState("");
  const [fillBlanks, setFillBlanks] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function generateQuiz() {
    setSummary("Loading...");
    setMcqs("Loading...");
    setFillBlanks("Loading...");

    if (!article.trim()) {
      alert("Please paste or upload an article first.");
      return;
    }

    const prompt = `
You are a quiz generator. Based on the article below, generate:

1. A 3-sentence summary.
2. Three multiple-choice questions (MCQs).
3. Two fill-in-the-blank questions.

Article:
"""${article}"""
`;

    try {
      const response = await callGeminiAPI(prompt);
      if (!response.ok) {
        handleApiError(response.status);
        return;
      }
      const result = await response.json();
      // console.log("API Response:", result);
      const content =
        result.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

      const summaryMatch = content.match(/1\. (.+?)2\./s);
      const mcqsMatch = content.match(/2\. (.+?)3\./s);
      const fillMatch = content.match(/3\. (.+)/s);

      setSummary(summaryMatch?.[1]?.trim() || "Not found.");
      setMcqs(mcqsMatch?.[1]?.trim() || "Not found.");
      setFillBlanks(fillMatch?.[1]?.trim() || "Not found.");
    } catch (error: any) {
      setSummary("Error: " + error.message);
      setMcqs("");
      setFillBlanks("");
    }
  }

  async function callGeminiAPI(prompt: string) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    return fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });
  }

  function handleApiError(status: number) {
    let message = "";
    switch (status) {
      case 400:
        message = "Bad request. Your prompt might contain prohibited content.";
        break;
      case 401:
        message = "Unauthorized. Your API key might be invalid.";
        break;
      case 403:
        message = "Forbidden. You don't have permission to use this API.";
        break;
      case 404:
        message = "Not found. The API endpoint or model doesn't exist.";
        break;
      case 429:
        message = "Too many requests. Please try again after a few minutes.";
        break;
      case 500:
      case 501:
      case 502:
      case 503:
        message = "Server error. Please try again later.";
        break;
      default:
        message = `API error (${status}). Please try again.`;
    }
    setSummary(message);
    setMcqs("");
    setFillBlanks("");
  }

  function readFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      alert("Please select a .txt file");
      return;
    }
    const reader = new FileReader();
    reader.onload = function (ev) {
      setArticle(ev.target?.result as string);
    };
    reader.readAsText(file);
  }

  function exportToPDF() {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(14);
    doc.text("Summary", 10, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(summary, 180), 10, y);

    y += 40;
    doc.setFontSize(14);
    doc.text("MCQs", 10, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(mcqs, 180), 10, y);

    y += 50;
    doc.setFontSize(14);
    doc.text("Fill in the Blanks", 10, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(fillBlanks, 180), 10, y);

    doc.save("quiz_notes.pdf");
  }

  return (
    <div className="container">
      <h1>AI Quiz & Notes Generator</h1>
      <textarea
        value={article}
        onChange={(e) => setArticle(e.target.value)}
        placeholder="Paste your article here..."
        rows={8}
        style={{ width: "100%", marginBottom: 12 }}
      />
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        onChange={readFile}
        style={{ marginBottom: 8 }}
      />
      <div className="buttons" style={{ marginBottom: 16 }}>
        <button onClick={generateQuiz}>Generate</button>
        <button onClick={exportToPDF}>Export to PDF</button>
      </div>
      <div id="output">
        <h2>Summary</h2>
        <div id="summary" style={{ whiteSpace: "pre-wrap" }}>{summary}</div>
        <h2>MCQs</h2>
        <div id="mcqs" style={{ whiteSpace: "pre-wrap" }}>{mcqs}</div>
        <h2>Fill in the Blanks</h2>
        <div id="fillBlanks" style={{ whiteSpace: "pre-wrap" }}>{fillBlanks}</div>
      </div>
    </div>
  );
}

export default App;