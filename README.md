# Bible Content Video Generation POC

Automated CLI tool that generates AI video content from user problem data using OpenAI (scripts) and Replicate Veo 3 (videos).

## Overview

This tool processes a CSV dataset of user problems and generates video content addressing those problems with biblical comfort and guidance. It produces individual video clips and a structured JSON output for integration with TheBibleChat.com's platform.

## Prerequisites

- Node.js >= 18.0.0
- OpenAI API key
- Replicate API token

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. Place your CSV data file in the `data/` directory

4. Review and adjust `config.json` if needed

## Usage

### First Time Setup

1. Build the project:
```bash
npm run build
```

2. Set up your environment variables in `.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
REPLICATE_API_TOKEN=r8_your-token-here
```

### Running the Pipeline

Generate videos (first run):
```bash
npm start generate
```

Resume interrupted pipeline:
```bash
npm start generate --resume
```

Clean output and start fresh:
```bash
npm run clean
npm start generate
```

Development mode (with hot reload):
```bash
npm run dev generate
```

### CLI Options

```bash
bible-video-gen generate [options]

Options:
  -c, --config <path>  Path to config file (default: "./config.json")
  --resume            Resume from last saved state
  --clean             Clean output directory before starting
  -h, --help          Display help
```

## Configuration

See `config.json` for pipeline configuration options:
- Input/output paths
- Problem categories to process
- Templates to use
- API settings
- Video generation parameters

## Output

Generated content will be saved in the `output/` directory:
- `output/videos/` - Video clip files (.mp4)
- `output/scripts/` - Generated scripts (JSON)
- `output/state.json` - Pipeline progress state
- `output/final-output.json` - Final output scaffold with metadata

## Project Structure

```
project-root/
├── src/           # TypeScript source code
├── data/          # Input CSV files
├── output/        # Generated content
├── config.json    # Configuration file
└── .env           # Environment variables (not in git)
```

## Documentation

See `_docs/` directory for detailed documentation:
- Product Requirements Document (PRD)
- Technical Specifications
- Implementation Plan

## License

MIT
