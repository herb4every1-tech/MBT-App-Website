import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY is missing. Email features will be disabled.");
}

// Helper to get Stripe configuration from database
async function getStripeConfig() {
  try {
    const { data, error } = await supabase
      .from('stripe_settings')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[Stripe] Database error fetching config:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.warn("[Stripe] No configuration found in stripe_settings table.");
      return null;
    }

    return data;
  } catch (err: any) {
    console.error("[Stripe] Unexpected error in getStripeConfig:", err);
    throw err;
  }
}

// Helper to get initialized Stripe client
async function getStripeClient() {
  const config = await getStripeConfig();
  
  // Try database first, then fallback to environment variable
  const secretKey = config?.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("Stripe Secret Key is missing. Please configure it in the Admin Panel.");
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2026-02-25.clover' as any,
  });
}

// Increase payload limit for base64 images/pdfs
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Initialize Supabase admin client to bypass RLS for settings
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to get active API key
async function getActiveApiKey(userApiKey?: string) {
  if (userApiKey) return userApiKey;
  
  const { data, error } = await supabase
    .from('ai_system_settings')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error || !data) {
    throw new Error("No system API key configured.");
  }
  
  return data.api_key;
}

// Helper to get active model
async function getActiveModel(plan: string) {
  const { data } = await supabase
    .from('ai_system_settings')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (plan === 'pro') {
    return data?.pro_model || 'pixtral-large-latest';
  }
  return data?.free_model || 'mistral-small-2506';
}

const apiRouter = express.Router();

apiRouter.post('/get-payment-link', async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    // Fetch Stripe configuration from database
    const settings = await getStripeConfig();

    if (!settings || !settings.stripe_payment_link) {
      return res.status(400).json({ error: 'Stripe Payment Link is missing. Please set it in the Admin Panel -> Stripe Settings.' });
    }

    try {
      // Append client_reference_id and prefilled_email to the payment link
      const url = new URL(settings.stripe_payment_link);
      url.searchParams.append('client_reference_id', userId);
      url.searchParams.append('prefilled_email', email);

      return res.json({ url: url.toString() });
    } catch (urlError) {
      console.error('[Stripe] Invalid Payment Link URL:', settings.stripe_payment_link);
      return res.status(400).json({ error: 'The Stripe Payment Link saved in the Admin Panel is not a valid URL.' });
    }
  } catch (error: any) {
    console.error('Stripe Payment Link Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Route for Cancel Subscription
apiRouter.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 1. Get the stripe subscription ID from the database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', userId)
      .in('status', ['active', 'Active'])
      .maybeSingle();

    if (subError || !subscription) {
      console.error('[Stripe] Subscription not found for user:', userId, subError);
      return res.status(404).json({ 
        error: 'No active subscription found for this user. Please refresh the page and try again.' 
      });
    }

    // 2. Cancel the subscription in Stripe
    const stripe = await getStripeClient();
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    console.log(`[Stripe] Successfully cancelled subscription ${subscription.stripe_subscription_id} for user ${userId}`);

    return res.json({ success: true, message: 'Subscription cancelled successfully.' });
  } catch (error: any) {
    console.error('Stripe Cancel Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Route for Mistral Analysis
apiRouter.post('/analyze', async (req, res) => {
  try {
    const { files, language, profile } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    const activeApiKey = await getActiveApiKey(profile?.mistral_api_key);
    const activeModel = await getActiveModel(profile?.plan || 'free');
    
    // Get system message
    const { data: settings } = await supabase
      .from('ai_system_settings')
      .select('system_message')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    // Safety check: If the system message is too short or lacks the JSON schema, fall back to the safe default.
    const isSystemMessageValid = settings?.system_message && settings.system_message.length > 200 && settings.system_message.includes('{"score": number');
    
    const systemMessage = isSystemMessageValid ? settings.system_message : `You are an expert medical AI assistant for MBT (My Blood Test). You will be provided with 'Context from Knowledge Base' along with the user's blood test report. You must analyze the blood test report using ONLY the information and reference ranges provided in the Context. If specific markers are not in the Context, use standard medical knowledge but prioritize the Context.

CRITICAL GUIDELINES:
1. Be balanced and objective. Do NOT unnecessarily give critical alerts or tell the user to see a doctor if the abnormalities are minor or non-existent.
2. If ALL markers are within normal ranges, the "riskFlags", "insights", "actionPlan", and "supplements" arrays MUST be EMPTY [].
3. Only suggest "See a Doctor" or "Urgent" for significant, clinically relevant abnormalities.
4. If everything is normal, provide a reassuring summary and a high health score (e.g., 90-100).
5. Do NOT make an action plan if no action is needed.

You MUST output your analysis EXACTLY as a JSON object matching this schema. Do not include any markdown formatting (like \`\`\`json), just the raw JSON object:

{
  "score": number (0-100, overall health score),
  "summary": "string (2-3 sentences summarizing overall health)",
  "table": [
    {
      "parameter": "string (e.g., Hemoglobin)",
      "value": "string (e.g., 14.2)",
      "numericValue": number (e.g., 14.2),
      "minRange": number,
      "maxRange": number,
      "unit": "string",
      "status": "Normal" | "Borderline" | "High" | "Low"
    }
  ],
  "riskFlags": [
    {
      "condition": "string",
      "urgency": "Monitor" | "See a Doctor" | "Urgent",
      "explanation": "string",
      "markers": ["string"]
    }
  ],
  "categories": [
    {
      "name": "string (Heart Health, Blood Health, Blood Sugar, Organ Function, Bones & Minerals, Immune System)",
      "icon": "Heart" | "Droplet" | "Sugar" | "Activity" | "Bone" | "Shield",
      "color": "string (hex code, e.g., #10B981 for good, #F59E0B for borderline, #EF4444 for bad)",
      "score": number (0-100),
      "points": ["string (short bullet points)"],
      "markers": ["string"]
    }
  ],
  "insights": [
    {
      "marker": "string (name of abnormal marker)",
      "meaning": "string (1 sentence)",
      "causes": ["string"],
      "tips": ["string"],
      "retest": "string (e.g., 3 months)"
    }
  ],
  "actionPlan": [
    {
      "timeframe": "string (e.g., This week, This month)",
      "title": "string",
      "description": "string"
    }
  ],
  "supplements": [
    {
      "name": "string",
      "dosage": "string",
      "reason": "string"
    }
  ],
  "foods": {
    "eatMore": [
      { "name": "string", "emoji": "string" }
    ],
    "reduce": [
      { "name": "string", "emoji": "string" }
    ]
  }
}`;

    const finalSystemMessage = `${systemMessage}\n\nIMPORTANT: You MUST provide the entire response in ${language}. All text fields, summaries, and insights in the JSON output MUST be written in ${language}.`;

    // 1. Extract text using Mistral OCR
    let extractedText = "";
    for (const file of files) {
      const ocrRequestBody = {
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          document_url: file.base64
        },
        include_image_base64: true
      };

      const ocrRes = await fetch('https://api.mistral.ai/v1/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeApiKey}`
        },
        body: JSON.stringify(ocrRequestBody)
      });

      const ocrData = await ocrRes.json();
      if (!ocrRes.ok) {
        throw new Error(ocrData.message || `OCR API Error: ${ocrRes.status}`);
      }

      if (ocrData.pages && Array.isArray(ocrData.pages)) {
        const pageTexts = ocrData.pages.map((p: any) => p.markdown).join('\n\n');
        extractedText += `\n\n--- Extracted Text from ${file.name} ---\n${pageTexts}`;
      }
    }

    if (!extractedText) {
      throw new Error("Could not extract text from the uploaded files.");
    }

    // 2. RAG Flow (Embeddings & Match)
    let contextText = "";
    try {
      const queryText = extractedText.substring(0, 1000);
      const embedRes = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-embed',
          input: [queryText]
        })
      });
      
      if (embedRes.ok) {
        const embedData = await embedRes.json();
        const embedding = embedData.data[0].embedding;

        const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
          query_embedding: embedding,
          match_threshold: 0.3,
          match_count: 5
        });

        if (!matchError && documents && documents.length > 0) {
          contextText = documents.map((doc: any) => doc.content).join('\n\n');
        }
      }
    } catch (ragError) {
      console.error("RAG Error:", ragError);
    }

    // 3. Chat Completions
    const promptText = `Context from Knowledge Base:
${contextText}

User Blood Test Report:
${extractedText}

INSTRUCTIONS:
1. Analyze the blood test report based on the provided context.
2. Output the result in JSON format as specified in the system instructions.`;

    const requestBody = {
      model: activeModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: finalSystemMessage },
        { role: "user", content: promptText }
      ],
      temperature: 0.2
    };

    const chatRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const chatData = await chatRes.json();
    if (!chatRes.ok) {
      throw new Error(chatData.message || `API Error: ${chatRes.status}`);
    }

    const resultText = chatData.choices[0].message.content;
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    res.json({
      ...parsedData,
      usage: chatData.usage
    });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during analysis" });
  }
});

// API Route for Chat
apiRouter.post('/chat', async (req, res) => {
  try {
    const { messages, analysisContext, profile, analysisId, messageCount } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const activeApiKey = await getActiveApiKey(profile?.mistral_api_key);
    const activeModel = await getActiveModel(profile?.plan || 'free');
    
    const lastUserMessage = messages[messages.length - 1].content;

    // RAG Flow (Embeddings & Match) for the latest user message
    let contextText = "";
    try {
      const queryText = lastUserMessage.substring(0, 1000);
      const embedRes = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-embed',
          input: [queryText]
        })
      });
      
      if (embedRes.ok) {
        const embedData = await embedRes.json();
        const embedding = embedData.data[0].embedding;

        const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
          query_embedding: embedding,
          match_threshold: 0.3,
          match_count: 5
        });

        if (!matchError && documents && documents.length > 0) {
          contextText = documents.map((doc: any) => doc.content).join('\n\n');
        }
      }
    } catch (ragError) {
      console.error("RAG Error in chat:", ragError);
    }

    const systemInstruction = `You are a helpful medical AI assistant. 
You are chatting with a user about their blood test analysis.
Here is the context of their analysis:
${JSON.stringify(analysisContext)}

${contextText ? `Here is some additional context from the medical knowledge base that might help answer the user's question:\n${contextText}\n\n` : ''}
Answer their questions based on this context and the knowledge base. 
IMPORTANT: Be VERY concise and short by default (1-3 sentences maximum). Only be descriptive and provide longer explanations if the user explicitly asks for details, a full explanation, or more information.
Do not provide definitive medical diagnoses, but explain the results and what they might mean.
Always advise them to consult a healthcare professional for serious concerns.`;

    const requestBody = {
      model: activeModel,
      messages: [
        { role: "system", content: systemInstruction },
        ...messages
      ],
      temperature: 0.3
    };

    const chatRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const chatData = await chatRes.json();
    if (!chatRes.ok) {
      throw new Error(chatData.message || `API Error: ${chatRes.status}`);
    }

    const reply = chatData.choices[0].message.content;

    // Update database using service role key
    if (analysisId) {
      const updatedMessages = [...messages, { role: 'assistant', content: reply }];
      const newCount = (messageCount || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('analyses')
        .update({ 
          chat_history: updatedMessages,
          chat_message_count: newCount
        })
        .eq('id', analysisId);

      if (updateError) {
        console.error("Failed to save chat history to database:", updateError);
      }
    }

    res.json({ 
      reply
    });

  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during chat" });
  }
});

// API Route for Admin Testing
apiRouter.post('/test-mistral', async (req, res) => {
  try {
    const { apiKey, model, systemMessage, prompt, fileBase64 } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    let extractedText = "";
    
    // 1. Extract text if file provided
    if (fileBase64) {
      const ocrRequestBody = {
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          document_url: fileBase64
        },
        include_image_base64: true
      };

      const ocrRes = await fetch('https://api.mistral.ai/v1/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(ocrRequestBody)
      });

      const ocrData = await ocrRes.json();
      if (!ocrRes.ok) {
        throw new Error(ocrData.message || `OCR API Error: ${ocrRes.status}`);
      }

      if (ocrData.pages && Array.isArray(ocrData.pages)) {
        extractedText = ocrData.pages.map((p: any) => p.markdown).join('\n\n');
      }
    }

    // 2. Chat Completions
    let finalPrompt = prompt || "Analyze this blood test report.";
    if (extractedText) {
      finalPrompt += `\n\nExtracted Text:\n${extractedText}`;
    }

    const requestBody = {
      model: model || "mistral-small-2506",
      messages: [
        { role: "system", content: systemMessage || "You are a helpful AI assistant." },
        { role: "user", content: finalPrompt }
      ],
      temperature: 0.2
    };

    const chatRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const chatData = await chatRes.json();
    if (!chatRes.ok) {
      throw new Error(chatData.message || `API Error: ${chatRes.status}`);
    }

    res.json({ 
      result: chatData.choices[0].message.content,
      usage: chatData.usage,
      request: requestBody,
      response: chatData
    });

  } catch (error: any) {
    console.error("Test Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during testing" });
  }
});

// Public Config Endpoint
apiRouter.get('/config', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ai_system_settings')
      .select('free_limit, free_model, pro_model')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    res.json(data || { free_limit: 3, free_model: 'mistral-small-2506', pro_model: 'pixtral-large-latest' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mount API Router
app.use('/api', apiRouter);

// Debug 404s for API
app.use('/api/*', (req, res) => {
  console.log(`[API 404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const os = await import('os');
  const networkInterfaces = os.networkInterfaces();
  const ips: string[] = [];
  
  Object.keys(networkInterfaces).forEach((key) => {
    networkInterfaces[key]?.forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local address: http://localhost:${PORT}`);
    ips.forEach(ip => {
      console.log(`Network address: http://${ip}:${PORT}`);
    });
    console.log(`Ready for Android app at: http://${ips[0] || '127.0.0.1'}:${PORT}/api`);
  });
}

startServer();
