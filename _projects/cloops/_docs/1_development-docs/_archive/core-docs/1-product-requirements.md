# Bible Content Video Generation - Product Requirements Document

## Project Overview

### Purpose
Build a proof-of-concept (POC) automated video generation pipeline for TheBibleChat.com that processes user problem data and generates AI-generated video content addressing those problems with biblical comfort and guidance.

### Context
TheBibleChat.com has an extensive internal automated distribution and marketing platform. This POC will generate video assets (clips) that can be plugged into their existing content pipeline. The focus is on proving the concept works end-to-end, not building a production-ready system.

### Success Criteria
- Successfully processes CSV data and extracts problem categories
- Generates video clips for multiple problem categories using different template styles
- Produces clean JSON output that the CTO can integrate into their existing platform
- Demonstrates repeatable, configurable workflow

## Target Output

### Primary Deliverables
1. **Video Assets**: Individual 10-second video clips (not stitched together)
2. **JSON Scaffold**: Structured data file containing:
   - Video file paths/references
   - Problem categories
   - Template types used
   - Metadata for each video/scene

### Format Requirements
- Video format: Vertical (9:16 aspect ratio)
- Video length: ~10 seconds per clip
- File organization: Clearly structured for easy integration

## Data Source

### Input
CSV file with ~170 rows containing:
- `denomination`: User's Christian denomination
- `onboardingV7_lifeChallenge`: Free-text user problem descriptions (variable quality, some empty)
- `age`: Age bracket (25-34, 35-44)
- `gender`: Male/Female
- `lifeChallengeOption`: Pre-categorized problem type

### Problem Categories
Extract and use the 9 existing categories from `lifeChallengeOption`:
1. Anxiety or fear
2. Stress or burnout
3. Finances or provision
4. Purpose or direction
5. Loneliness or heartbreak
6. Family or relationships
7. Addiction or temptation
8. Health or healing
9. Grief or loss

### Data Processing Approach
- Use existing categories (no re-processing or clustering)
- Ignore empty or minimal entries
- Focus on category-level content generation (not individual user stories)

## Core Pipeline

### High-Level Flow
```
CSV Input ’ Extract Categories ’ Generate Content ’ Create Videos ’ Output JSON + Assets
```

### Detailed Stages
1. **Data Processing**: Read CSV, extract 9 problem categories
2. **Content Generation**: For each category × template combination, generate scripts
3. **Scene Breakdown**: Structure each script into 3 scenes with specific prompts
4. **Video Generation**: Generate video clips using AI models
5. **Output Assembly**: Collect clips and create JSON scaffold

## Video Templates

### Template Philosophy
Templates define the **format and style** of video presentation. Different templates require different script types and generation approaches.

### POC Templates (2)

#### Template 1: Direct-to-Camera
- **Format**: Person speaking directly to viewer
- **Style**: Empathetic, conversational, comforting
- **Structure**: 3 scenes showing emotional progression
  - Scene 1: Acknowledging the struggle (empathetic expression)
  - Scene 2: Offering comfort/hope (warm, reassuring)
  - Scene 3: Sharing scripture/closing (peaceful, uplifting)
- **Script Type**: Conversational dialogue for spoken delivery

#### Template 2: Text + Visuals
- **Format**: Text overlays on calming background footage
- **Style**: Reflective, peaceful, inspirational
- **Structure**: 3 scenes with text progression
  - Scene 1: Opening acknowledgment (calming visual)
  - Scene 2: Scripture/comfort text (different visual)
  - Scene 3: Closing message (uplifting visual)
- **Script Type**: Short, punchy text snippets for visual display

### Template Architecture
- Each template defines its own script format
- Script generation adapts to template requirements
- Scenes inherit template format + category-specific content
- Prompts combine template style + problem context + cinematography direction

## Content Generation

### Script Generation Process
- **Input**: Problem category + Template type
- **Process**: LLM (OpenAI gpt-4o-mini) generates structured content
- **Output**:
  - Overall video script/narrative
  - 3 scene-specific content pieces
  - Cinematography prompts for each scene

### Script Structure
Each generated script includes:
- Overall narrative/theme for the video
- 3 distinct scenes with specific content
- Detailed visual/cinematography prompts for AI video generation

### Prompt Generation
LLM creates "director of photography" style prompts that describe:
- Visual composition and framing
- Lighting and mood
- Subject/setting details
- Emotional tone
- Action/movement (if applicable)

## Video Generation

### Technology
- **Platform**: Replicate API
- **Model**: Veo 3 (Google's text-to-video model)
- **Workflow**: Direct text-to-video (single-step)
- **Output**: 10-second video clips per prompt

### Generation Approach
- One API call per scene (3 calls per video)
- Sequential execution (configurable for parallel later)
- Polling/waiting for completion
- Error handling and retries

## Configuration

### POC Scope Parameters
```
categories: 2 (subset for testing)
templates: 2 (Direct-to-camera, Text + Visuals)
scenesPerVideo: 3
variationsPerCombo: 1
execution: sequential
```

### Scalability Design
All parameters should be configurable to easily scale:
- Increase to all 9 categories
- Add more templates
- Generate multiple variations per combination
- Switch to parallel execution

## Technical Requirements

### Technology Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **Script Generation**: OpenAI API (gpt-4o-mini)
- **Video Generation**: Replicate API (Veo 3)

### Key Features
- [ ] CSV parsing and data extraction
- [ ] Configurable pipeline parameters
- [ ] LLM-based script generation
  - [ ] Template-specific script formatting
  - [ ] Scene breakdown
  - [ ] Cinematography prompt generation
- [ ] Video generation via Replicate API
  - [ ] Async handling (polling/webhooks)
  - [ ] Error handling and retries
  - [ ] Rate limit management
- [ ] File management
  - [ ] Organized video file storage
  - [ ] Clear naming conventions
- [ ] State management
  - [ ] Track generation progress
  - [ ] Resume capability if interrupted
- [ ] Output generation
  - [ ] JSON scaffold with metadata
  - [ ] File path references

### Integration Considerations
- Clean, simple code structure for maintainability
- Modular design for easy extension
- Clear separation between pipeline stages
- Designed for integration with larger platform

## Non-Goals (Out of Scope for POC)

- Video stitching/editing (CTO handles this)
- Using individual user problem text (focus on categories)
- Demographics-based personalization
- Database storage
- Web UI or dashboard
- Authentication/authorization
- Advanced error recovery
- Production deployment infrastructure
- Cost optimization
- Extensive testing suite
- Performance optimization

## Success Metrics

### POC Completion Criteria
1. Successfully generates videos for 2 categories × 2 templates = 4 videos (12 clips total)
2. Videos are relevant to problem categories
3. Both template styles produce distinct, appropriate content
4. JSON output is well-structured and contains necessary metadata
5. Pipeline is configurable and can be easily scaled
6. Process is repeatable and automated

### Quality Indicators
- Generated scripts are coherent and appropriate for each category
- Video clips match the intended template style
- Cinematography prompts produce relevant visuals
- Technical execution is clean and maintainable

## Future Considerations (Post-POC)

- Scale to all 9 categories
- Add more template variations
- Generate multiple versions per category/template
- Incorporate actual user problem text for personalization
- Parallel execution for faster processing
- Webhooks for async video generation
- Cost tracking and optimization
- Production-ready error handling
- Integration testing with CTO's platform
