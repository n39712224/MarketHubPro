import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing required OpenAI API key: OPENAI_API_KEY');
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIDescriptionRequest {
  title: string;
  category: string;
  condition: string;
  price: number;
  keyFeatures?: string;
  basicDescription?: string;
}

export interface AIDescriptionResponse {
  description: string;
  suggestedTitle?: string;
  suggestedCategory?: string;
  suggestedKeywords?: string[];
}

export async function generateDescription(request: AIDescriptionRequest): Promise<AIDescriptionResponse> {
  try {
    const prompt = `You are an expert e-commerce copywriter helping someone create an attractive product listing. Generate an engaging product description based on the following details:

Title: ${request.title}
Category: ${request.category}
Condition: ${request.condition}
Price: $${request.price}
${request.keyFeatures ? `Key Features: ${request.keyFeatures}` : ''}
${request.basicDescription ? `Basic Description: ${request.basicDescription}` : ''}

Please create:
1. An engaging, sales-focused description (2-3 paragraphs)
2. Suggest an improved title if the current one can be better
3. Suggest a better category if needed
4. Provide 3-5 relevant keywords for searchability

Focus on benefits, quality, and value. Make it compelling but honest. Include relevant details about condition, shipping, and any standout features.

Respond in JSON format with the following structure:
{
  "description": "The main product description",
  "suggestedTitle": "Improved title (only if different from original)",
  "suggestedCategory": "Better category (only if different from original)", 
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert e-commerce copywriter. Always respond with valid JSON that matches the requested format exactly."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content!);

    return {
      description: result.description || request.basicDescription || '',
      suggestedTitle: result.suggestedTitle !== request.title ? result.suggestedTitle : undefined,
      suggestedCategory: result.suggestedCategory !== request.category ? result.suggestedCategory : undefined,
      suggestedKeywords: result.suggestedKeywords || [],
    };
  } catch (error) {
    console.error('AI description generation failed:', error);
    throw new Error("Failed to generate AI description. Please try again.");
  }
}

export async function improveDescription(currentDescription: string, context: Partial<AIDescriptionRequest>): Promise<string> {
  try {
    const prompt = `Improve this product description to make it more engaging and sales-focused:

Current Description: "${currentDescription}"

Context:
${context.title ? `Title: ${context.title}` : ''}
${context.category ? `Category: ${context.category}` : ''}
${context.condition ? `Condition: ${context.condition}` : ''}
${context.price ? `Price: $${context.price}` : ''}

Make the description more compelling while keeping it honest and accurate. Focus on benefits, quality, and value proposition.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert e-commerce copywriter. Improve product descriptions to be more engaging and sales-focused while remaining honest and accurate."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content!.trim();
  } catch (error) {
    console.error('AI description improvement failed:', error);
    throw new Error("Failed to improve description. Please try again.");
  }
}

export async function suggestTitleAndCategory(description: string, currentTitle?: string): Promise<{title: string, category: string}> {
  try {
    const prompt = `Based on this product description, suggest an optimal title and category:

Description: "${description}"
${currentTitle ? `Current Title: "${currentTitle}"` : ''}

Available categories: electronics, clothing, home, books, sports, other

Respond in JSON format:
{
  "title": "Optimized product title (max 80 characters)",
  "category": "best_category_match"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at optimizing product listings. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return {
      title: result.title || currentTitle || 'Product',
      category: result.category || 'other',
    };
  } catch (error) {
    console.error('AI title/category suggestion failed:', error);
    throw new Error("Failed to generate suggestions. Please try again.");
  }
}

export async function enhanceImage(base64Image: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this product image and provide suggestions to improve it for marketplace listing. Focus on lighting, composition, background, and overall presentation quality. Respond with JSON: { 'suggestions': ['suggestion1', 'suggestion2'], 'quality_score': number_1_to_10 }"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    return response.choices[0].message.content || "{}";
  } catch (error) {
    console.error("AI image enhancement failed:", error);
    throw new Error("Failed to analyze image quality");
  }
}

export async function generateImageDescription(base64Image: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Create a detailed, attractive product description based on this image. Focus on key features, condition, and selling points that would appeal to buyers."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 400,
    });

    return response.choices[0].message.content || "No description generated";
  } catch (error) {
    console.error("AI image description failed:", error);
    throw new Error("Failed to generate description from image");
  }
}