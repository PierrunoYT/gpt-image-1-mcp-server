#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import OpenAI from "openai";
import * as fs from 'fs';
import * as path from 'path';

// Check for required environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openaiClient: OpenAI | null = null;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required');
  console.error('Please set your OpenAI API key: export OPENAI_API_KEY=your_api_key_here');
  // Server continues running, no process.exit()
} else {
  // Configure OpenAI client
  openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
}

// Define types based on OpenAI API
interface OpenAIImageResult {
  data: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
}

// Save base64 image function
async function saveBase64Image(b64Data: string, filename: string): Promise<string> {
  try {
    // Create images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const filePath = path.join(imagesDir, filename);
    const buffer = Buffer.from(b64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    return filePath;
  } catch (error) {
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate safe filename for images
function generateImageFilename(prompt: string, index: number): string {
  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `gpt_image_1_${safePrompt}_${index}_${timestamp}.png`;
}

// Create MCP server
const server = new McpServer({
  name: "gpt-image-1-server",
  version: "1.0.0",
});

// Tool: Generate images with GPT-Image-1
server.tool(
  "gpt_image_1_generate",
  {
    description: "Generate high-quality images using OpenAI's GPT-Image-1 model",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The text prompt describing what you want to see"
        },
        size: {
          type: "string",
          enum: ["1024x1024", "1024x1536", "1536x1024"],
          description: "The size of the generated image",
          default: "1024x1024"
        },
        n: {
          type: "integer",
          minimum: 1,
          maximum: 4,
          description: "Number of images to generate (1-4)",
          default: 1
        }
      },
      required: ["prompt"]
    }
  },
  async (args: any) => {
    // Check if OpenAI client is configured
    if (!openaiClient) {
      return {
        content: [{
          type: "text",
          text: "Error: OPENAI_API_KEY environment variable is not set. Please configure your OpenAI API key."
        }],
        isError: true
      };
    }

    const { prompt, size = "1024x1024", n = 1 } = args;
    
    try {
      console.error(`Generating ${n} image(s) with prompt: "${prompt}"`);

      // Call OpenAI Images API
      const result = await openaiClient.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
        size: size as "1024x1024" | "1024x1536" | "1536x1024",
        n: n,
        response_format: "b64_json"
      }) as OpenAIImageResult;

      // Save images locally
      console.error("Saving images locally...");
      const savedImages = [];

      for (let i = 0; i < result.data.length; i++) {
        const imageData = result.data[i];
        const filename = generateImageFilename(prompt, i + 1);
        
        try {
          if (imageData.b64_json) {
            const localPath = await saveBase64Image(imageData.b64_json, filename);
            savedImages.push({
              localPath,
              index: i + 1,
              revised_prompt: imageData.revised_prompt
            });
            console.error(`Saved: ${filename}`);
          } else {
            throw new Error("No base64 data received");
          }
        } catch (saveError) {
          console.error(`Failed to save image ${i + 1}:`, saveError);
          savedImages.push({
            localPath: null,
            index: i + 1,
            revised_prompt: imageData.revised_prompt,
            error: saveError instanceof Error ? saveError.message : 'Unknown error'
          });
        }
      }

      // Format response with save information
      const imageDetails = savedImages.map(img => {
        let details = `Image ${img.index}:`;
        if (img.localPath) {
          details += `\n  Local Path: ${img.localPath}`;
        } else if (img.error) {
          details += `\n  Save Error: ${img.error}`;
        }
        if (img.revised_prompt) {
          details += `\n  Revised Prompt: ${img.revised_prompt}`;
        }
        return details;
      }).join('\n\n');

      const responseText = `Successfully generated ${savedImages.length} image(s) using GPT-Image-1:

Prompt: "${prompt}"
Size: ${size}
Number of Images: ${n}

Generated Images:
${imageDetails}

${savedImages.some(img => img.localPath) ? 'Images have been saved to the local \'images\' directory.' : 'Note: Local save failed, but images were generated successfully.'}`;

      return {
        content: [
          {
            type: "text",
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Error generating image:', error);
      
      let errorMessage = "Failed to generate image with GPT-Image-1.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }

      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ],
        isError: true
      };
    }
  }
);

// Tool: Generate images with variations support
server.tool(
  "gpt_image_1_generate_with_variations",
  {
    description: "Generate images using GPT-Image-1 with support for creating variations of existing images",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The text prompt describing what you want to see"
        },
        size: {
          type: "string",
          enum: ["1024x1024", "1024x1536", "1536x1024"],
          description: "The size of the generated image",
          default: "1024x1024"
        },
        n: {
          type: "integer",
          minimum: 1,
          maximum: 4,
          description: "Number of images to generate (1-4)",
          default: 1
        },
        style: {
          type: "string",
          description: "Optional style guidance for the image generation"
        },
        quality: {
          type: "string",
          enum: ["standard", "hd"],
          description: "The quality of the image that will be generated",
          default: "standard"
        }
      },
      required: ["prompt"]
    }
  },
  async (args: any) => {
    // Check if OpenAI client is configured
    if (!openaiClient) {
      return {
        content: [{
          type: "text",
          text: "Error: OPENAI_API_KEY environment variable is not set. Please configure your OpenAI API key."
        }],
        isError: true
      };
    }

    const { prompt, size = "1024x1024", n = 1, style, quality = "standard" } = args;
    
    try {
      // Enhance prompt with style if provided
      let enhancedPrompt = prompt;
      if (style) {
        enhancedPrompt = `${prompt}, in ${style} style`;
      }

      console.error(`Generating ${n} image(s) with enhanced prompt: "${enhancedPrompt}"`);

      // Call OpenAI Images API with enhanced parameters
      const result = await openaiClient.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        size: size as "1024x1024" | "1024x1536" | "1536x1024",
        n: n,
        quality: quality as "standard" | "hd",
        response_format: "b64_json"
      }) as OpenAIImageResult;

      // Save images locally
      console.error("Saving images locally...");
      const savedImages = [];

      for (let i = 0; i < result.data.length; i++) {
        const imageData = result.data[i];
        const filename = generateImageFilename(enhancedPrompt, i + 1);
        
        try {
          if (imageData.b64_json) {
            const localPath = await saveBase64Image(imageData.b64_json, filename);
            savedImages.push({
              localPath,
              index: i + 1,
              revised_prompt: imageData.revised_prompt
            });
            console.error(`Saved: ${filename}`);
          } else {
            throw new Error("No base64 data received");
          }
        } catch (saveError) {
          console.error(`Failed to save image ${i + 1}:`, saveError);
          savedImages.push({
            localPath: null,
            index: i + 1,
            revised_prompt: imageData.revised_prompt,
            error: saveError instanceof Error ? saveError.message : 'Unknown error'
          });
        }
      }

      // Format response with save information
      const imageDetails = savedImages.map(img => {
        let details = `Image ${img.index}:`;
        if (img.localPath) {
          details += `\n  Local Path: ${img.localPath}`;
        } else if (img.error) {
          details += `\n  Save Error: ${img.error}`;
        }
        if (img.revised_prompt) {
          details += `\n  Revised Prompt: ${img.revised_prompt}`;
        }
        return details;
      }).join('\n\n');

      const responseText = `Successfully generated ${savedImages.length} image(s) using GPT-Image-1 with variations:

Original Prompt: "${prompt}"
${style ? `Style: ${style}` : ''}
Enhanced Prompt: "${enhancedPrompt}"
Size: ${size}
Quality: ${quality}
Number of Images: ${n}

Generated Images:
${imageDetails}

${savedImages.some(img => img.localPath) ? 'Images have been saved to the local \'images\' directory.' : 'Note: Local save failed, but images were generated successfully.'}`;

      return {
        content: [
          {
            type: "text",
            text: responseText
          }
        ]
      };

    } catch (error) {
      console.error('Error generating image with variations:', error);
      
      let errorMessage = "Failed to generate image with GPT-Image-1 variations.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }

      return {
        content: [
          {
            type: "text",
            text: errorMessage
          }
        ],
        isError: true
      };
    }
  }
);

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GPT-Image-1 MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  // Don't exit the process, let it continue running
});