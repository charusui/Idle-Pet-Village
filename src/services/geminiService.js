// ============================================================
// Gemini API Service — Adventure Portal
// ============================================================

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const TEXT_MODEL = 'gemini-3.1-flash-lite-preview';

const TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${API_KEY}`;

/**
 * Generate a complete 3-encounter quest from a party description.
 * @param {string} partyDescription - Formatted string describing the player's pet party
 * @returns {Promise<Object>} Parsed quest JSON matching the quest schema
 */
export async function generateQuest(partyDescription) {
  const prompt = `You are the Arcane Narrator for "Idle Pet Village", a fantasy pet-collection RPG.

The player has assembled a party of pets for an adventure quest. Generate a complete quest with EXACTLY 3 encounters.

PLAYER'S PARTY:
${partyDescription}

WORLD ZONES (for setting inspiration):
- Whispering Woods: Misty ancient forest, earth element
- Coral Atoll: Crystal clear tropical waters, water element
- Ember Summit: Smoldering volcanic peak, fire element
- Crystal Depths: Glowing crystal caverns, earth element
- Zephyr Peaks: Sky-high mountains with endless winds, air element

RULES:
1. Each encounter must have a vivid scene_description (2-3 sentences, visual, painterly — this will be used to generate an illustration).
2. Each encounter has exactly 3 choices. Each choice should feel meaningfully different.
3. For each choice, specify which element(s) would make it succeed. A choice succeeds if the party has at least one pet whose element matches. If no element matches, the choice fails.
4. One choice per encounter should be a "universal" option that any party can attempt (element: "any") but with a lower reward tier.
5. The narrative should be a self-contained mini-story with a beginning, middle, and climactic finale.
6. Scale difficulty/rewards loosely based on the average level and evolution stage of the party.
7. Keep all text family-friendly, whimsical, and thematic to a fantasy pet world.

Respond with ONLY valid JSON in this exact schema:

{
  "quest_title": "string",
  "quest_intro": "string — 2-3 sentences setting the scene",
  "encounters": [
    {
      "id": 1,
      "scene_description": "string — vivid visual description for image generation (painterly fantasy style, no text in image)",
      "narrative": "string — what the party encounters (2-4 sentences)",
      "choices": [
        {
          "id": "A",
          "label": "string — short action label",
          "description": "string — 1-2 sentences describing the action",
          "element": "fire|water|earth|air|any",
          "success_text": "string — 2-3 sentences on success",
          "failure_text": "string — 2-3 sentences on failure",
          "reward_tier": "low|medium|high"
        },
        {
          "id": "B",
          "label": "string",
          "description": "string",
          "element": "fire|water|earth|air|any",
          "success_text": "string",
          "failure_text": "string",
          "reward_tier": "low|medium|high"
        },
        {
          "id": "C",
          "label": "string",
          "description": "string",
          "element": "fire|water|earth|air|any",
          "success_text": "string",
          "failure_text": "string",
          "reward_tier": "low|medium|high"
        }
      ]
    }
  ]
}`;

  const response = await fetch(TEXT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[Gemini Text Error] ${response.status}:`, errText);
    throw new Error(`Quest generation failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Empty response from quest generation API');
  }

  // Extract the first balanced JSON object
  let jsonString = '';
  let braceCount = 0;
  let foundStart = false;

  for (let i = 0; i < rawText.length; i++) {
    if (rawText[i] === '{') {
      if (!foundStart) foundStart = true;
      braceCount++;
    }
    if (foundStart) {
      jsonString += rawText[i];
      if (rawText[i] === '}') {
        braceCount--;
        if (braceCount === 0) break; // Found the matching end brace
      }
    }
  }

  if (!jsonString) {
    console.error('No balanced JSON object found. Raw:', rawText);
    throw new Error('The portal returned a garbled message. Try again!');
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON Parse Error. Extracted:', jsonString);
    throw new Error(`Failed to parse quest JSON: ${e.message}`);
  }
}

/**
 * Generate a scene image using Pollinations.ai (Free, Fast, No-Key)
 */
export async function generateSceneImage(description) {
  try {
    const shortDesc = description.substring(0, 300);

    const styleSuffix =
      ', digital painting, ethereal fantasy art, cinematic lighting, ' +
      'high detail, masterpiece, no text, no real-life people, ' +
      'fantasy creatures only, non-human characters, whimsical RPG setting, 16:9 aspect ratio';

    const encodedPrompt = encodeURIComponent(shortDesc + styleSuffix);
    // Using a random seed for variety
    const seed = Math.floor(Math.random() * 1000000);

    // Primary endpoint
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;

    return imageUrl;
  } catch (error) {
    console.error('Pollinations generation failed:', error);
    return null;
  }
}