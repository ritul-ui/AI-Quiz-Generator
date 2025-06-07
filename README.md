# AI Quiz & Notes Generator

This project is a web application that generates summaries, multiple-choice questions (MCQs), and fill-in-the-blank questions from any article or text you provide. It uses the Google Gemini API for AI-powered content generation and allows exporting the results as a PDF.

## Features

- Paste or upload a `.txt` article to generate:
  - A 3-sentence summary
  - Three MCQs
  - Two fill-in-the-blank questions
- Export the generated content to a PDF file
- Simple, clean, and responsive UI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/quiz-generator.git
   cd quiz-generator

   ```

2. **Install dependencies:**

```sh
npm install
```

3. set up your Google Gemini API key:

- Create a `.env` file in the root directory and add your API key:

  ```
  VITE_API_KEY=your_api_key_here
  ```

  5.  **Run the development server:**

```sh
npm run dev
```
