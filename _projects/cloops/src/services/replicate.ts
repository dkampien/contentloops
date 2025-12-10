import Replicate from 'replicate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import * as http from 'node:http';
import { getEnv } from '../utils/env.js';
import type { ReplicateService, GenerationConfig, GenerateImageParams } from '../types/index.js';

let client: Replicate | null = null;

function getClient(): Replicate {
  if (!client) {
    const env = getEnv();
    client = new Replicate({
      auth: env.REPLICATE_API_TOKEN,
    });
  }
  return client;
}

/**
 * Download a file from a URL to a local path
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(destPath);
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlinkSync(destPath);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * Generate an image using Replicate API and save to specified path
 */
async function generateImageInternal(params: GenerateImageParams, outputPath: string): Promise<string> {
  const { model, prompt, params: genParams } = params;
  const replicate = getClient();

  console.log(`Generating image with ${model}...`);

  const output = await replicate.run(model as `${string}/${string}`, {
    input: {
      prompt,
      ...genParams,
    },
  });

  // FileOutput from SDK - just convert to string which gives the URL
  // FileOutput implements toString() that returns the URL
  let imageUrl: string;

  if (Array.isArray(output) && output.length > 0) {
    // Model returned array of outputs, get first one
    imageUrl = String(output[0]);
  } else if (output) {
    // Single output
    imageUrl = String(output);
  } else {
    throw new Error('No output from model');
  }

  // Validate it's a URL
  if (!imageUrl.startsWith('http')) {
    throw new Error(`Invalid image URL: ${imageUrl.slice(0, 100)}`);
  }

  console.log('Image URL:', imageUrl.slice(0, 80) + '...');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Download directly to output path
  await downloadFile(imageUrl, outputPath);

  console.log(`Image saved to: ${outputPath}`);
  return outputPath;
}

/**
 * Generate a single image (service interface method)
 */
async function generateImage(prompt: string, config: GenerationConfig, outputPath: string): Promise<string> {
  return generateImageInternal({
    model: config.model,
    prompt,
    params: config.params,
  }, outputPath);
}

/**
 * Generate multiple images sequentially to output directory
 */
async function generateImages(prompts: string[], config: GenerationConfig, outputDir: string): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < prompts.length; i++) {
    console.log(`Generating image ${i + 1}/${prompts.length}...`);
    const outputPath = path.join(outputDir, `${i + 1}.jpg`);
    const localPath = await generateImage(prompts[i], config, outputPath);
    results.push(localPath);
  }

  return results;
}

/**
 * Create a Replicate service instance
 */
export function createReplicateService(): ReplicateService {
  return {
    generateImage,
    generateImages,
  };
}

// Export raw internal function for backwards compatibility during refactor
export { generateImageInternal };
