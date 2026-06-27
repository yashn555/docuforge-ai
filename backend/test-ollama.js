import axios from 'axios';
import chalk from 'chalk';

const OLLAMA_HOST = 'http://localhost:11434';

async function testOllama() {
  console.log(chalk.blue('🧪 Testing Ollama connection...'));
  
  try {
    // Check if Ollama is running
    const tagsResponse = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 5000 });
    console.log(chalk.green('✅ Ollama is running'));
    
    const models = tagsResponse.data.models || [];
    const modelNames = models.map(m => m.name);
    console.log(chalk.gray('Available models:'), modelNames.join(', '));
    
    // Find the smallest available model
    let testModel = null;
    const preferredModels = ['tinyllama:latest', 'llama2:latest', 'llama3.2:3b'];
    
    for (const preferred of preferredModels) {
      if (modelNames.some(name => name === preferred || name.startsWith(preferred))) {
        testModel = preferred;
        break;
      }
    }
    
    if (!testModel && modelNames.length > 0) {
      testModel = modelNames[0];
    }
    
    if (!testModel) {
      console.log(chalk.red('❌ No models available'));
      return;
    }
    
    console.log(chalk.yellow(`\n📝 Testing generation with ${testModel}...`));
    
    const testPrompts = [
      'Write a one-sentence summary of machine learning.',
      'Write a very short introduction about AI.',
      'Explain what a project report is in one sentence.'
    ];
    
    for (const prompt of testPrompts) {
      console.log(chalk.gray(`\n📝 Prompt: "${prompt}"`));
      const startTime = Date.now();
      
      try {
        const response = await axios.post(
          `${OLLAMA_HOST}/api/generate`,
          {
            model: testModel,
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.7,
              num_predict: 100,
              num_ctx: 1024,
            }
          },
          { timeout: 15000 }
        );
        
        const time = Date.now() - startTime;
        
        if (response.data && response.data.response) {
          const text = response.data.response.trim();
          console.log(chalk.green(`✅ Generated in ${time}ms (${text.length} chars)`));
          console.log(chalk.gray(`Response: ${text}`));
          break; // Success, stop testing
        } else {
          console.log(chalk.yellow(`⚠️ No response`));
        }
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Failed in ${Date.now() - startTime}ms: ${error.message}`));
        if (error.response) {
          console.log(chalk.gray(`Error details:`, error.response.data));
        }
      }
    }
    
    console.log(chalk.green('\n✅ Test complete!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error.message);
  }
}

testOllama();