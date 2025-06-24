# GPT-Image-1 MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--Image--1-green)](https://openai.com/)

A Model Context Protocol (MCP) server that provides access to OpenAI's GPT-Image-1 model. This server enables high-quality image generation using OpenAI's latest image generation model with enhanced detail, richer lighting, and fewer artifacts.

**🔗 Repository**: [https://github.com/PierrunoYT/gpt-image-1-mcp-server](https://github.com/PierrunoYT/gpt-image-1-mcp-server)

> **🚀 Ready to use!** Pre-built executable included - no compilation required.
>
> **✅ Enhanced Reliability**: Server handles missing API keys gracefully without crashes and includes robust error handling.

## Features

- **High-Quality Image Generation**: Uses OpenAI's GPT-Image-1 model
- **Automatic Image Download**: Generated images are automatically saved to local `images` directory as PNG files
- **Multiple Sizes**: Support for 1024x1024, 1024x1536, and 1536x1024 resolutions
- **Batch Generation**: Generate up to 4 images at once
- **Style Variations**: Enhanced tool with style guidance support
- **Quality Control**: Standard and HD quality options
- **Base64 Processing**: Handles OpenAI's base64 image format automatically
- **Detailed Responses**: Returns local file paths with generation metadata
- **Robust Error Handling**: Graceful handling of missing API keys without server crashes
- **Universal Portability**: Works anywhere with npx - no local installation required
- **Enhanced Reliability**: Graceful shutdown handlers and comprehensive error reporting

## Prerequisites

- Node.js 18 or higher
- OpenAI API key with access to GPT-Image-1 model

## Installation

### 1. Get your OpenAI API Key

- Visit [OpenAI Platform](https://platform.openai.com/)
- Sign up for an account or log in
- Navigate to API Keys section
- Generate an API key
- Ensure you have access to the GPT-Image-1 model

### 2. Clone or Download

```bash
git clone https://github.com/PierrunoYT/gpt-image-1-mcp-server.git
cd gpt-image-1-mcp-server
```

### 3. Install Dependencies (Optional)

The server is pre-built, but if you want to modify it:

```bash
npm install
npm run build
```

## Configuration

### 🚀 Recommended: Universal npx Configuration (Works Everywhere)

**Best option for portability** - works on any machine with Node.js:

```json
{
  "mcpServers": {
    "gpt-image-1": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/PierrunoYT/gpt-image-1-mcp-server.git"
      ],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

**Benefits:**
- ✅ **Universal Access**: Works on any machine with Node.js
- ✅ **No Local Installation**: npx downloads and runs automatically
- ✅ **Always Latest Version**: Pulls from GitHub repository
- ✅ **Cross-Platform**: Windows, macOS, Linux compatible
- ✅ **Settings Sync**: Works everywhere you use your MCP client

### Alternative: Local Installation

If you prefer to install locally, use the path helper:

```bash
npm run get-path
```

This will output the complete MCP configuration with the correct absolute path.

#### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "gpt-image-1": {
      "command": "node",
      "args": ["path/to/gpt-image-1-mcp-server/build/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

#### For Kilo Code MCP Settings

Add to your MCP settings file at:
`C:\Users\[username]\AppData\Roaming\Kilo-Code\MCP\settings\mcp_settings.json`

```json
{
  "mcpServers": {
    "gpt-image-1": {
      "command": "node",
      "args": ["path/to/gpt-image-1-mcp-server/build/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Available Tools

### `gpt_image_1_generate`

Generate images using OpenAI's GPT-Image-1 model with standard processing.

**Parameters:**
- `prompt` (required): Text description of the image to generate
- `size` (optional): "1024x1024", "1024x1536", or "1536x1024" (default: "1024x1024")
- `n` (optional): Number of images to generate, 1-4 (default: 1)

**Response includes:**
- Local file paths for saved PNG images
- Generation metadata (revised prompts if applicable)
- File information and save status

### `gpt_image_1_generate_with_variations`

Generate images using GPT-Image-1 with enhanced style control and quality options.

**Parameters:**
- `prompt` (required): Text description of the image to generate
- `size` (optional): "1024x1024", "1024x1536", or "1536x1024" (default: "1024x1024")
- `n` (optional): Number of images to generate, 1-4 (default: 1)
- `style` (optional): Style guidance for the image generation
- `quality` (optional): "standard" or "hd" (default: "standard")

**Use this tool when:**
- You want to specify a particular artistic style
- You need higher quality (HD) images
- You want enhanced control over the generation process
- Creating variations of a concept with different styles

**Features:**
- Style-enhanced prompts for better artistic control
- HD quality option for higher resolution details
- Enhanced metadata in responses

## 📥 **How Image Download Works**

The GPT-Image-1 MCP server automatically processes and saves generated images to your local machine. Here's the complete process:

### **1. Image Generation Flow**
1. **API Call**: Server calls OpenAI's GPT-Image-1 API
2. **Response**: OpenAI returns base64-encoded image data
3. **Auto-Save**: Server immediately converts and saves images as PNG files
4. **Response**: Returns local file paths and generation metadata

### **2. Base64 Processing Implementation**

#### **Save Function** ([`saveBase64Image`](src/index.ts:32-46)):
```typescript
async function saveBase64Image(b64Data: string, filename: string): Promise<string> {
  // 1. Create 'images' directory if it doesn't exist
  const imagesDir = path.join(process.cwd(), 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // 2. Convert base64 to buffer and save as PNG
  const filePath = path.join(imagesDir, filename);
  const buffer = Buffer.from(b64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
}
```

#### **Filename Generation** ([`generateImageFilename`](src/index.ts:49-57)):
```typescript
function generateImageFilename(prompt: string, index: number): string {
  // Creates safe filename: gpt_image_1_prompt_index_timestamp.png
  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .substring(0, 50);            // Limit length
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `gpt_image_1_${safePrompt}_${index}_${timestamp}.png`;
}
```

### **3. File Storage Details**

#### **Directory Structure:**
```
your-project/
├── images/                    # Auto-created directory
│   ├── gpt_image_1_mountain_landscape_1_2025-06-24T18-30-45-123Z.png
│   ├── gpt_image_1_cute_robot_1_2025-06-24T18-31-20-456Z.png
│   └── ...
```

#### **Filename Format:**
- **Prefix**: `gpt_image_1_`
- **Prompt**: First 50 chars, sanitized (alphanumeric + underscores)
- **Index**: Image number (for multiple images)
- **Timestamp**: ISO timestamp for uniqueness
- **Extension**: `.png`

### **4. Response Format**

The server returns detailed information about saved images:
```
Successfully generated 1 image(s) using GPT-Image-1:

Prompt: "a serene mountain landscape"
Size: 1024x1024
Number of Images: 1

Generated Images:
Image 1:
  Local Path: /path/to/project/images/gpt_image_1_a_serene_mountain_landscape_1_2025-06-24T18-30-45-123Z.png
  Revised Prompt: A serene mountain landscape with snow-capped peaks...

Images have been saved to the local 'images' directory.
```

### **5. Benefits of Local Processing**

✅ **Persistent Storage**: Images saved locally as standard PNG files
✅ **Offline Access**: View images without internet connection
✅ **Organized Storage**: All images in dedicated `images` directory
✅ **Unique Naming**: No filename conflicts with timestamp system
✅ **Standard Format**: PNG files compatible with all image viewers
✅ **No URL Expiration**: Local files never expire unlike temporary URLs

## Example Usage

### Basic Image Generation
```
Generate a photorealistic image of a golden retriever playing in a field of sunflowers
```

### With Specific Parameters
```
Generate an image with:
- Prompt: "A minimalist logo design for a tech startup, clean lines"
- Size: 1536x1024
- Number of images: 2
```

### Advanced Usage with Style
```
Generate an image of "A futuristic cityscape at night with neon lights and flying cars" 
with style "cyberpunk art" and HD quality
```

## Technical Details

### Architecture
- **Language**: TypeScript with ES2022 target
- **Runtime**: Node.js 18+ with ES modules
- **Protocol**: Model Context Protocol (MCP) SDK v1.0.0
- **API Client**: OpenAI JavaScript SDK v4.0.0
- **Validation**: Zod schema validation

### API Model Used
- **Model**: `gpt-image-1` (OpenAI's latest image generation model)
- **Response Format**: `b64_json` (base64-encoded PNG data)
- **Supported Sizes**: 1024x1024, 1024x1536, 1536x1024

### Error Handling
- **Graceful API key handling**: Server continues running even without OPENAI_API_KEY set
- **No crash failures**: Removed `process.exit()` calls that caused connection drops
- **Null safety checks**: All tools validate API client availability before execution
- **Graceful shutdown**: Proper SIGINT and SIGTERM signal handling
- **API error catching**: Comprehensive error reporting with detailed context
- **File save error handling**: Graceful fallback with detailed error messages
- **User-friendly messages**: Clear error descriptions instead of technical crashes

## Development

### Project Structure
```
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/                # Compiled JavaScript (ready to use)
├── test-server.js        # Server testing utility
├── get-path.js          # Configuration path helper
├── example-mcp-config.json # Example configuration
├── package.json         # Project metadata and dependencies
└── tsconfig.json        # TypeScript configuration
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run start` - Start the server directly
- `npm run test` - Test server startup and basic functionality
- `npm run get-path` - Get configuration path for your system

### Making Changes
1. Edit files in the `src/` directory
2. Run `npm run build` to compile
3. Restart your MCP client to use the updated server

### Testing
```bash
npm run test
```

This runs an OpenAI API connectivity test that verifies:
- OpenAI API key is configured correctly
- API connection is working
- Available image generation models
- GPT-Image-1 model access

## API Costs

This server uses OpenAI's API, which charges per image generation. Check [OpenAI pricing](https://openai.com/pricing) for current rates.

**Typical costs** (as of 2024):
- GPT-Image-1: ~$0.04-0.08 per image depending on size and quality
- HD quality images cost more than standard quality
- Costs vary by resolution (1024x1024 vs 1536x1024)

## Troubleshooting

### Server not appearing in MCP client
1. **Recommended**: Use the npx configuration for universal compatibility
2. If using local installation, verify the path to `build/index.js` is correct and absolute
3. Ensure Node.js 18+ is installed: `node --version`
4. Test server startup: `npm run test`
5. Restart your MCP client (Claude Desktop, Kilo Code, etc.)
6. **Note**: Server will start successfully even without OPENAI_API_KEY - check tool responses for API key errors

### Image generation failing
1. Verify your OpenAI API key is valid and has sufficient credits
2. Ensure you have access to the GPT-Image-1 model (may require specific API tier)
3. Check that your prompt follows OpenAI's content policy
4. Try reducing the number of images or simplifying the prompt
5. Check the server logs for detailed error messages
6. Verify your account has image generation capabilities enabled

### Build issues
If you need to rebuild the server:
```bash
npm install
npm run build
```

### Configuration issues
Use the helper script to get the correct path:
```bash
npm run get-path
```

## Support

For issues with:
- **This MCP server**: Create an issue in this repository
- **OpenAI API**: Check [OpenAI documentation](https://platform.openai.com/docs)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run test`
5. Submit a pull request

## Changelog

### v1.0.0 (Latest)
- **🎨 Initial release with GPT-Image-1**: Complete rewrite to use OpenAI's GPT-Image-1 model
- **📥 Automatic base64 processing**: Generated images automatically converted and saved as PNG files
- **🗂️ Smart filename generation**: Images saved with descriptive names including prompt and timestamp
- **🔄 Enhanced tools**: Two generation tools with different feature sets (basic and with variations)
- **📁 Auto-directory creation**: Creates `images` folder automatically if it doesn't exist
- **🛡️ Robust error handling**: Graceful handling of API errors and file save failures
- **🎨 Style support**: Enhanced tool with style guidance and quality control
- **🌍 Universal portability**: Updated for npx usage - works universally without local installation
- **✅ Production ready**: Comprehensive error handling and user-friendly messages

## Migration from FAL Imagen 4

If you're migrating from the previous FAL Imagen 4 MCP server:

1. **Update your configuration** to use `OPENAI_API_KEY` instead of `FAL_KEY`
2. **Tool names changed**:
   - `imagen4_generate` → `gpt_image_1_generate`
   - `imagen4_generate_async` → `gpt_image_1_generate_with_variations`
3. **Parameter changes**:
   - `aspect_ratio` → `size` (with specific resolution options)
   - `negative_prompt` → removed (not supported by GPT-Image-1)
   - Added `quality` and `style` parameters for enhanced control
4. **Response format**: Now includes revised prompts and local PNG file paths
5. **Image format**: All images saved as PNG files instead of various formats