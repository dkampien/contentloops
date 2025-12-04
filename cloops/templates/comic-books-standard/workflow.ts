import type {
  StoryInput,
  TemplateConfig,
  Services,
  WorkflowContext,
  Page,
  PagePrompt,
  PromptsMdData,
} from '../../src/types/index.js';
import { injectVariables } from '../../src/utils/config.js';
import { writePromptsMd, readPromptsMd, getBundleDir, ensureDir } from '../../src/services/storage.js';

// ===== Workflow Implementation =====

export async function run(
  input: StoryInput,
  config: TemplateConfig,
  services: Services,
  ctx: WorkflowContext
): Promise<void> {
  // Track state through the workflow
  let narrative: string | undefined;
  let pages: Page[] | undefined;
  let prompts: PagePrompt[] | undefined;
  let thumbnailPrompt: string | undefined;
  let images: string[] | undefined;
  let thumbnailImage: string | undefined;

  // ===== REPLAY MODE: Load from prompts.md =====
  if (ctx.replay) {
    console.log('\n[REPLAY] Loading from prompts.md...');
    const replayData = readPromptsMd(config.name, ctx.storyId);

    if (!replayData) {
      throw new Error(`No prompts.md found for ${ctx.storyId}. Run without --replay first.`);
    }

    // Use saved data instead of running LLM calls
    pages = replayData.pages;
    prompts = replayData.imagePrompts.map((prompt, i) => ({
      pageNumber: i + 1,
      prompt,
    }));
    thumbnailPrompt = replayData.thumbnailPrompt;

    console.log(`✓ Loaded ${pages.length} pages`);
    console.log(`✓ Loaded ${prompts.length} image prompts`);
    console.log(`✓ Loaded thumbnail prompt`);

    // Skip to generation
  } else {
    // ===== Step 1: Narrative =====
    console.log('\n--- NARRATIVE ---');
    {
      const systemPrompt = ctx.prompts['step1-narrative'] || 'Generate a narrative adaptation.';
      const userMessage = `Write the Bible story narrative for:

Title: ${input.title}
Summary: ${input.summary}
Key moments to include: ${input.keyMoments.join(', ')}`;

      const result = await services.llm.call<{ narrative: string }>({
        systemPrompt,
        userMessage,
        schema: ctx.schemas['narrative'],
      });

      narrative = result.narrative;
      console.log(`✓ Narrative generated (${narrative.length} chars)`);
    }

    // ===== Step 2: Planning =====
    console.log('\n--- PLANNING ---');
    {
      const systemPrompt = ctx.prompts['step2-planning'] || 'Break the narrative into pages and panels.';
      const userMessage = `Break this narrative into comic book pages and panels:

${narrative}`;

      const result = await services.llm.call<{ pages: Page[] }>({
        systemPrompt,
        userMessage,
        schema: ctx.schemas['planning'],
        reasoning: 'low',
        verbosity: 'low',
      });

      pages = result.pages;
      console.log(`✓ Planning complete (${pages.length} pages)`);
    }

    // ===== Step 3: Prompts =====
    console.log('\n--- PROMPTS ---');
    {
      const styleVars = {
        ...config.style,
        ...config.settings,
      };

      let systemPrompt = ctx.prompts['step3-prompts'] || 'Generate image prompts for each page.';
      systemPrompt = injectVariables(systemPrompt, styleVars);

      // Strip dialogue if disabled in config
      let pagesForPrompts = pages;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dialogueEnabled = (config.settings as any).dialogue;
      if (!dialogueEnabled) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pagesForPrompts = pages!.map((p: any) => ({
          ...p,
          panels: p.panels.map((panel: any) => {
            const { dialogue, ...rest } = panel;
            return rest;
          })
        }));
        console.log('  (dialogue disabled - stripped from pages)');
      }

      const pagesJson = JSON.stringify(pagesForPrompts, null, 2);
      const userMessage = `Generate image prompts from these panels using the blocks provided.

${pagesJson}`;

      const result = await services.llm.call<{ prompts: PagePrompt[] }>({
        systemPrompt,
        userMessage,
        schema: ctx.schemas['prompts'],
        reasoning: 'medium',
        verbosity: 'low',
      });

      prompts = result.prompts;
      console.log(`✓ Prompts generated (${prompts.length} prompts)`);

      // Log each prompt for review
      prompts.forEach((p) => {
        console.log(`  Page ${p.pageNumber}: ${p.prompt.slice(0, 60)}...`);
      });
    }

    // ===== Step 4: Thumbnail =====
    console.log('\n--- THUMBNAIL ---');
    {
      const systemPrompt = ctx.prompts['step4-thumbnail'] || 'Generate a thumbnail prompt.';
      const userMessage = `Create a thumbnail prompt for this comic:

Title: ${input.title}`;

      const result = await services.llm.call<{ prompt: string }>({
        systemPrompt,
        userMessage,
        schema: ctx.schemas['thumbnail'],
        reasoning: 'low',
        verbosity: 'low',
      });

      thumbnailPrompt = result.prompt;
      console.log(`✓ Thumbnail prompt generated`);
      console.log(`  ${thumbnailPrompt.slice(0, 80)}...`);
    }
  }

  // ===== Save prompts.md (before generation, so replay works if cut) =====
  if (!ctx.replay && narrative && pages && prompts && thumbnailPrompt) {
    const promptsData: PromptsMdData = {
      storyId: ctx.storyId,
      title: input.title,
      narrative,
      pages,
      imagePrompts: prompts.map((p) => p.prompt),
      thumbnailPrompt,
    };
    writePromptsMd(config.name, ctx.storyId, promptsData);
    console.log('\n✓ Saved prompts.md');
  }

  // ===== Step 5: Generation (skip in dry run) =====
  if (ctx.dry) {
    console.log('\n[DRY RUN] Skipping image generation');
    return;
  }

  console.log('\n--- GENERATION ---');
  {
    if (!prompts || prompts.length === 0) {
      throw new Error('No prompts available for generation');
    }

    // Get output directory and ensure it exists
    const outputDir = getBundleDir(config.name, ctx.storyId);
    ensureDir(outputDir);

    // Generate page images directly to output
    const promptStrings = prompts.map((p) => p.prompt);
    images = await services.replicate.generateImages(promptStrings, config.generation, outputDir);
    console.log(`✓ Generated ${images.length} page images`);

    // Generate thumbnail directly to output
    if (thumbnailPrompt) {
      const thumbnailPath = `${outputDir}/thumbnail.jpg`;
      thumbnailImage = await services.replicate.generateImage(thumbnailPrompt, config.generation, thumbnailPath);
      console.log(`✓ Generated thumbnail image`);
    }
  }

  // ===== Step 6: Bundle =====
  console.log('\n--- BUNDLE ---');
  {
    if (!pages || !images) {
      throw new Error('Missing pages or images for bundle');
    }

    services.storage.writeBundle(ctx.storyId, {
      title: input.title,
      images,
      pages,
      thumbnailImage,
    });

    console.log(`✓ Bundle written`);
  }

}
