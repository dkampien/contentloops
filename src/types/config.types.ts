/**
 * Configuration Types
 * Type definitions for the application configuration
 */

export interface Config {
  // Input/Output paths
  paths: {
    csvInput: string;           // Path to CSV file
    outputDir: string;          // Base output directory
    videosDir: string;          // Video clips directory
    scriptsDir: string;         // Generated scripts directory
    stateFile: string;          // State JSON file
    finalOutput: string;        // Final output JSON
  };

  // Pipeline parameters
  pipeline: {
    categories: string[] | "all";   // Specific categories or "all"
    templates: string[];            // Template IDs to use
    scenesPerVideo: number;         // Number of scenes per video
    variationsPerCombo: number;     // Variations per category+template
    execution: "sequential" | "parallel";
  };

  // API configuration
  apis: {
    openai: {
      apiKey: string;               // From env: OPENAI_API_KEY
      model: string;                // "gpt-4o-mini"
      temperature: number;          // 0.7
      maxTokens: number;            // 2000
    };
    replicate: {
      apiKey: string;               // From env: REPLICATE_API_TOKEN
      model: string;                // "google/veo-3"
      pollingInterval: number;      // 5000 (ms)
      maxRetries: number;           // 3
    };
  };

  // Veo 3 specific parameters
  videoGeneration: {
    aspectRatio: "9:16" | "16:9";   // Video aspect ratio
    duration: 4 | 6 | 8;            // Video duration in seconds (Veo 3 only supports 4, 6, 8)
    resolution?: "720p" | "1080p";  // Optional resolution
    generateAudio?: boolean;        // Optional audio generation
  };
}
