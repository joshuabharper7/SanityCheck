# SanityCheck: Local-First AI Interview Simulator

![SanityCheck Logo](public/logo.png)

SanityCheck is a privacy-first, zero-dependency, open-source mock interview platform. It operates entirely on your local machine, requiring no remote cloud APIs, tracking metrics, or external data processing.

## 🚀 Core Architectural Pillars

- **Total Data Sovereignty**: Confidential resumes, job descriptions, and interview recordings never leave your computer.
- **Zero-Cost Iteration**: Run infinite mock interviews without third-party API token fees.
- **Conversational Low-Latency**: Achieves near real-time feedback loops using local LLMs.
- **"No-BS" Grading**: A specialized evaluation engine that rewards honesty and penalizes bluffing or hallucinations.

## ✨ Key Features

- **Voice Interface**: Hands-free interview experience using browser-native Speech-to-Text and Text-to-Speech.
- **Cross-Domain Versatility**: Built-in logic dynamically pivots between Software Engineering whiteboards, Medical/Clinical patient scenarios, and Business behavioral questions.
- **Global Multi-Language Support**: Support for English, Spanish, French, German, Mandarin, and Japanese interviews.
- **Smart Pipeline Generation**: Analyzes any Job Description to craft a customized 2-4 stage interview roadmap.
- **Split-Screen Workspace**: Transitions from conversational chat to a technical sandbox for whiteboard and scenario assessments.
- **Hardware-Adaptive Tiering**: Choose from LITE, STANDARD, or PRO tiers to match your machine's VRAM/RAM capabilities.
- **Dynamic Theming**: 5 high-fidelity visual styles including `Sleek Dark`, `Ocean Blue`, and `Royal Amethyst`.

## 🛠️ Prerequisites & Setup

1.  **Ollama**: SanityCheck requires [Ollama](https://ollama.com/) to be running locally (`ollama serve`).
    - The app's built-in **Onboarding Wizard** will detect if you have it and provide a direct download link if needed.
2.  **Models**: Use the built-in wizard to pull the required models (`llama3.1`, `qwen2.5-coder`, etc.) with a single click.

## 📥 Installation

### For Developers
1.  **Clone & Install**:
    ```bash
    git clone https://github.com/joshuabharper7/SanityCheck.git
    cd SanityCheck
    npm install
    ```
2.  **Launch**: Double-click `SanityCheck.exe` or run `npm run dev`.

### For Buddies (Non-Technical)
If you received a **Portable Zip** from a friend:
1.  **Unzip** the folder.
2.  **Run**: Double-click `Run-Portable.bat`. 
    - *Note: No Node.js installation is required for this mode!*

## 📦 Creating a Portable Release
To share SanityCheck with a non-technical friend:
1.  Run `Build-Portable.bat`.
2.  Zip the resulting `SanityCheck-Portable` folder and send it over.
3.  They can now run the full AI experience with zero configuration.

## 🖥️ Desktop Shortcut
To create a branded shortcut on your Windows Desktop with the official SanityCheck logo:
1.  Navigate to the project (or unzipped portable) folder.
2.  Right-click **`Setup-Shortcut.ps1`**.
3.  Select **"Run with PowerShell"**.

## 🧠 Model Tiers

- **LITE** (< 8GB RAM): `llama3.2:3b` / `qwen2.5-coder:7b`
- **STANDARD** (8GB - 16GB RAM): `llama3.1:8b` / `qwen2.5-coder:14b`
- **PRO** (>= 16GB RAM): `llama3.1:8b` / `qwen3-coder:30b`

*Use the built-in **Onboarding Wizard** to pull these models automatically.*

## 📄 License

Open-source under the MIT License.
