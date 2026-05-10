# Idle Pet Village: Arcane Expeditions

## Inspiration
It's 10:00 PM. You've evolved your favorite Galaxy Cat to its final stage, but you've seen every pre-written quest a hundred times. You want a story that has never been told, in a world that hasn't been drawn yet. Why should game worlds be static?

This frustration inspired **Idle Pet Village** — a Generative AI Engine that transforms traditional idle gaming into an infinite, procedurally-narrated RPG experience where every pixel and note is refined by intelligence.

## What it does
Idle Pet Village is a multi-modal AI simulation engine that fuses classic pet collection with a vast generative ecosystem:

*   🔭 **Narrative Weaver:** Uses Gemini 3.1 Flash Lite Preview to weave unique, context-aware RPG encounters based on your specific pet's species, history, level, and element.
*   🎨 **Arcane Painter:** Integrates **Pollinations.ai (Flux)** to paint high-fidelity fantasy scenes in real-time for every encounter, ensuring the world expands as you explore it.
*   🎵 **Harmonic Oracle:** Features an AI-curated sonic landscape where every zone—from the Whispering Woods to the Crystal Depths—is brought to life by thematic scores designed to evoke deep immersion.
*   🎭 **Visual Alchemist:** Uses a custom HTML5 Canvas engine to process AI-generated pet animations in real-time, stripping backgrounds via flood-fill logic for seamless integration into the UI.
*   🗺️ **Cartographic Mind:** The game map isn't just a static image; it's a gateway to AI-generated biomes, where the "Adventure Portal" serves as a neural bridge between the player and the machine's imagination.
*   ✨ **Evolution Engine:** Pets undergo a "Triple-Stage AI Evolution," where their forms, names, and generated quest descriptions grow in complexity alongside the player's progress.

**Key Innovation:** We bypass standard static asset limitations by using **Referrer-blind Generative Buffering**, allowing us to stream high-definition AI assets directly into the UI with production-grade stability.

## How we built it
*   **Intelligence:** Gemini 3.1 Flash Lite (Reasoning) + Pollinations.ai / Flux Model (Creative Vision).
*   **Engine:** React + Vite + Vanilla CSS (A custom-built "Parchment & Glow" design system).
*   **Media Pipeline:** Custom HTML5 Canvas pixel-processing for transparent video rendering.
*   **Audio Architecture:** A dynamic state-based Audio Controller for managing zone-specific immersion.
*   **Deployment:** Vercel Edge functions for low-latency AI orchestration.

## Challenges we ran into
*   **Real-time Multimodal Sync:** Synchronizing text generation, image painting, and background processing within a single 7-second "Generative Buffer."
*   **Production Audio Constraints:** Navigating strict browser autoplay policies with a "Silent Priming" mechanism that unlocks the entire audio engine on the first user interaction.
*   **CSS Architecture:** Resolving complex build-time minification errors by un-nesting global animation rules to satisfy Vercel’s production requirements.
*   **Asset Security:** Implementing `no-referrer` security bridges to allow high-bandwidth cross-origin AI images to load reliably on all domains.

## Accomplishments we're proud of
*   **Generative Immersion:** One of the first idle games to unify AI story generation with real-time AI image generation for a truly "limitless" quest system.
*   **Pet Evolution Narrative:** Successfully implemented a system where pet growth isn't just numerical, but visual and narrative, driven by AI logic.
*   **Zero-Latency Perception:** Used synthetic UI transitions to mask complex API calls, creating a "smooth as glass" user experience.

## What we learned
*   **Gemini's Reasoning Speed:** How to leverage the 3.1 Flash Lite's low latency to make AI feel like a core part of the gameplay loop rather than a slow add-on.
*   **Buffer Design:** The importance of "Generative Buffering" in maintaining player state during high-compute operations.
*   **Web-Standard Pushing:** Pushing the limits of the HTML5 Canvas API for real-time video manipulation.

## What's next for Idle Pet Village
*   **Generative Soundtracks:** Moving from curated scores to fully AI-generated music tracks tailored to the specific mood of each quest.
*   **Pet Personalities:** Giving each pet a "Neural Memory" so they remember past adventures and develop unique dialogue styles.
*   **Global Market:** A real-time player-driven economy for trading items discovered in the deep AI biomes.
*   **Synchronous Multiplayer:** Real-time cooperative dungeon crawling where parties can meet and quest together in the Arcane Portal.

## Installation

To run **Idle Pet Village** locally, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/charusui/Idle-Pet-Village.git
    cd Idle-Pet-Village
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory and add your Gemini API Key:
    ```bash
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```
    *(Get your key at [Google AI Studio](https://aistudio.google.com/))*

4.  **Launch the Game:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser to begin your adventure!
