#!/usr/bin/env node

// Simple test script to verify OpenAI GPT-Image-1 integration
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.log('❌ OPENAI_API_KEY environment variable not set');
  console.log('Please set your OpenAI API key: export OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

console.log('🔑 OpenAI API Key found');
console.log('🧪 Testing OpenAI client initialization...');

try {
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
  
  console.log('✅ OpenAI client initialized successfully');
  console.log('📋 Available models endpoint test...');
  
  // Test API connectivity by listing models
  const models = await openai.models.list();
  const gptImageModels = models.data.filter(model => 
    model.id.includes('gpt-image') || model.id.includes('dall-e')
  );
  
  console.log('✅ API connection successful');
  console.log(`📊 Found ${gptImageModels.length} image generation models:`);
  
  gptImageModels.forEach(model => {
    console.log(`  - ${model.id}`);
  });
  
  if (gptImageModels.some(model => model.id === 'gpt-image-1')) {
    console.log('🎨 GPT-Image-1 model is available!');
  } else {
    console.log('⚠️  GPT-Image-1 model not found in available models');
    console.log('   This might be due to API access limitations');
  }
  
  console.log('\n🚀 MCP Server is ready to use!');
  
} catch (error) {
  console.error('❌ Error testing OpenAI integration:', error.message);
  
  if (error.status === 401) {
    console.log('🔐 Authentication failed - please check your API key');
  } else if (error.status === 429) {
    console.log('⏰ Rate limit exceeded - please try again later');
  } else {
    console.log('🔍 Please check your internet connection and API key');
  }
  
  process.exit(1);
}