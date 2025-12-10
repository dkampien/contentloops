# Implementation Plan - Bible Content Video Generation POC

## Project Setup

- [ ] Step 1: Initialize TypeScript project
  - **Task**: Set up Node.js project with TypeScript configuration, package.json, and basic project structure
  - **Files**:
    - `package.json`: Define project metadata, scripts, and dependencies
    - `tsconfig.json`: Configure TypeScript compiler options (strict mode, ES2020, module resolution)
    - `.gitignore`: Exclude node_modules, output/, .env
    - `.env.example`: Template for required environment variables
    - `README.md`: Basic setup and usage instructions
  - **Step Dependencies**: None
  - **User Instructions**:
    - Run `npm install` after this step
    - Copy `.env.example` to `.env` and add API keys (OPENAI_API_KEY, REPLICATE_API_TOKEN)

- [ ] Step 2: Create project directory structure
  - **Task**: Create all necessary directories for source code, output, and data as defined in technical specs
  - **Files**:
    - `src/config/` (directory)
    - `src/lib/` (directory)
    - `src/types/` (directory)
    - `src/utils/` (directory)
    - `data/` (directory)
    - `output/videos/` (directory)
    - `output/scripts/` (directory)
  - **Step Dependencies**: Step 1
  - **User Instructions**: Place the CSV file (`bquxjob_696709f0_199c894db50.csv`) in the `data/` directory

---

## Core Infrastructure

- [ ] Step 3: Define TypeScript types and interfaces
  - **Task**: Create all type definitions for configuration, scripts, predictions, and output as specified in technical specs
  - **Files**:
    - `src/types/config.types.ts`: Config interface and schema
    - `src/types/script.types.ts`: VideoScript, Scene, Template interfaces and Zod schemas
    - `src/types/prediction.types.ts`: Replicate Prediction types
    - `src/types/output.types.ts`: FinalOutput, VideoOutput, ClipOutput interfaces
    - `src/types/state.types.ts`: PipelineState, VideoState, SceneState interfaces
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [ ] Step 4: Implement configuration system
  - **Task**: Create configuration loader that reads config.json and validates structure, with template definitions
  - **Files**:
    - `src/config/config.ts`: Config loading and validation logic
    - `src/config/templates.ts`: Template definitions with system prompts for both templates
    - `config.json`: Default configuration file in project root
  - **Step Dependencies**: Step 3
  - **User Instructions**: Review and adjust `config.json` if needed (categories, paths, API settings)

- [ ] Step 5: Create utility modules
  - **Task**: Implement logger, error classes, and helper functions
  - **Files**:
    - `src/utils/logger.ts`: Simple console logger with levels (info, warn, error, success)
    - `src/utils/errors.ts`: Custom error classes (PipelineError, CSVReadError, etc.)
    - `src/utils/helpers.ts`: Utility functions (sleep, retry logic, file path generation)
  - **Step Dependencies**: Step 3
  - **User Instructions**: None

---

## Pipeline Modules

- [ ] Step 6: Implement Data Processor
  - **Task**: Create CSV parser that extracts problem categories from the input file
  - **Files**:
    - `src/lib/data-processor.ts`: DataProcessor class with CSV parsing using csv-parse library
  - **Step Dependencies**: Steps 3, 5
  - **User Instructions**: None

- [ ] Step 7: Implement Script Generator
  - **Task**: Create OpenAI integration with structured output using Zod schemas for generating video scripts
  - **Files**:
    - `src/lib/script-generator.ts`: ScriptGenerator class with OpenAI client setup, Zod schema integration, and script generation logic
  - **Step Dependencies**: Steps 3, 4, 5
  - **User Instructions**: Ensure OPENAI_API_KEY is set in .env file

- [ ] Step 8: Implement Video Generator
  - **Task**: Create Replicate integration for Veo 3 video generation with polling and file download
  - **Files**:
    - `src/lib/video-generator.ts`: VideoGenerator class with Replicate client setup, prediction creation, polling logic, and video download
  - **Step Dependencies**: Steps 3, 4, 5
  - **User Instructions**: Ensure REPLICATE_API_TOKEN is set in .env file

- [ ] Step 9: Implement State Manager
  - **Task**: Create state persistence system for tracking progress and enabling resume functionality
  - **Files**:
    - `src/lib/state-manager.ts`: StateManager class with JSON-based state save/load, atomic writes, and update methods
  - **Step Dependencies**: Steps 3, 5
  - **User Instructions**: None

- [ ] Step 10: Implement Output Assembler
  - **Task**: Create final output JSON generator that collects all assets and metadata
  - **Files**:
    - `src/lib/output-assembler.ts`: OutputAssembler class that validates assets and generates final JSON
  - **Step Dependencies**: Steps 3, 5
  - **User Instructions**: None

---

## CLI Interface

- [ ] Step 11: Create CLI entry point
  - **Task**: Implement command-line interface using Commander.js with generate command, options for config/resume/clean
  - **Files**:
    - `src/index.ts`: CLI setup with Commander, main pipeline orchestration function, error handling, and graceful shutdown
  - **Step Dependencies**: Steps 4, 6, 7, 8, 9, 10
  - **User Instructions**: None

- [ ] Step 12: Add build and run scripts
  - **Task**: Configure build scripts and executable setup
  - **Files**:
    - `package.json`: Update with build, dev, and start scripts
  - **Step Dependencies**: Step 11
  - **User Instructions**:
    - Run `npm run build` to compile TypeScript
    - Run `npm start` to execute the pipeline

---

## Integration & Testing

- [ ] Step 13: Manual integration test
  - **Task**: Run end-to-end pipeline with 1 category and 1 template to validate all components work together
  - **Files**: None (testing only)
  - **Step Dependencies**: Step 12
  - **User Instructions**:
    - Temporarily update config.json to use only 1 category and 1 template
    - Run `npm start`
    - Verify: script JSON is generated, 3 video clips are created, state.json tracks progress, final-output.json is created
    - Check output/videos/ and output/scripts/ directories

- [ ] Step 14: Test resume functionality
  - **Task**: Verify state management by interrupting and resuming the pipeline
  - **Files**: None (testing only)
  - **Step Dependencies**: Step 13
  - **User Instructions**:
    - Run pipeline with 2 categories
    - Interrupt with Ctrl+C after first video completes
    - Verify state.json was saved
    - Run `npm start -- --resume`
    - Verify it continues from where it left off

- [ ] Step 15: Full POC test run
  - **Task**: Execute complete pipeline with 2 categories × 2 templates = 4 videos (12 clips total)
  - **Files**: None (testing only)
  - **Step Dependencies**: Step 14
  - **User Instructions**:
    - Reset config.json to POC defaults (2 categories, 2 templates)
    - Clear output directory
    - Run `npm start`
    - Verify all 12 clips are generated successfully
    - Review final-output.json structure
    - Manually inspect a few video clips to verify quality

---

## Documentation & Cleanup

- [ ] Step 16: Update documentation
  - **Task**: Update README with complete setup, usage instructions, and troubleshooting
  - **Files**:
    - `README.md`: Add detailed setup steps, configuration guide, usage examples, output structure explanation
    - `claude.md`: Update current stage to "Building ✓"
  - **Step Dependencies**: Step 15
  - **User Instructions**: None

- [ ] Step 17: Final review and handoff preparation
  - **Task**: Prepare deliverables and verify POC completion criteria
  - **Files**: None (review only)
  - **Step Dependencies**: Step 16
  - **User Instructions**:
    - Review POC completion criteria from PRD
    - Verify: 4 videos generated, both template styles distinct, JSON well-structured, pipeline configurable
    - Package output/ directory for delivery to CTO
    - Document any limitations or issues encountered

---

## Notes

### Estimated Effort
- **Project Setup**: ~30 minutes
- **Core Infrastructure**: ~1 hour
- **Pipeline Modules**: ~3-4 hours
- **CLI Interface**: ~1 hour
- **Integration & Testing**: ~2 hours
- **Total**: ~7-8 hours for POC completion

### Critical Path
Steps 6, 7, 8 (Data Processor, Script Generator, Video Generator) are the core functionality and should be prioritized. State Manager (Step 9) can be simplified if time is constrained.

### Potential Issues
- **API Rate Limits**: OpenAI and Replicate may have rate limits. Implement proper retry logic.
- **Video Generation Time**: Veo 3 can take several minutes per clip. 12 clips could take 30-60 minutes total.
- **Cost**: Monitor API usage. Estimate: ~$0.50-1.00 for OpenAI, $5-10 for Replicate (varies by usage).

### Future Enhancements (Post-POC)
- Parallel execution for faster processing
- Webhooks instead of polling
- Cost tracking
- More sophisticated error recovery
- Expand to all 9 categories
- Additional template variations
