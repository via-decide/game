Repair mode for repository via-decide/Game.

TARGET
Validate and repair only the files touched by the previous implementation.

TASK
Implement a low-level graphics pipeline called via-game-render to interface directly with the GPU. 1. Create src/core/graphics/. 2. Implement RenderDevice.ts to abstract WebGPU or Vulkan initialization, swap chains, and command buffers. 3. Create ShaderCompiler.ts to compile WGSL or SPIR-V shaders at runtime for materials and lighting. 4. Implement MeshBuffer.ts to upload Vertex and Index data directly to GPU VRAM. 5. Build a ForwardPlusRenderer.ts (or Deferred Renderer) to handle complex scene lighting, grouping light data into a tiled compute shader to support hundreds of dynamic lights. 6. Implement an InstancingEngine.ts to render thousands of identical objects (like grass or asteroids) in a single draw call.

RULES
1. Audit touched files first and identify regressions.
2. Preserve architecture and naming conventions.
3. Make minimal repairs only; do not expand scope.
4. Re-run checks and provide concise root-cause notes.
5. Return complete contents for changed files only.

SOP: REPAIR PROTOCOL (MANDATORY)
1. Strict Fix Only: Do not use repair mode to expand scope or add features.
2. Regression Check: Audit why previous attempt failed before proposing a fix.
3. Minimal Footprint: Only return contents for the actual repaired files.

REPO CONTEXT
- README snippet:
# VIA - Bharat's Social Platform 🇮🇳 VIA is a next-generation social platform designed for digital explorers navigating Bharat's social landscape. Discover, create, and deep dive into the stories that matter. ## 🚀 Features - **Dynamic Feed**: Real-time social feed with high-quality content. - *
- AGENTS snippet:
not found
- package.json snippet:
{ "name": "react-example", "private": true, "version": "0.0.0", "type": "module", "scripts": { "dev": "vite --port=3000 --host=0.0.0.0", "build": "vite build", "preview": "vite preview", "clean": "rm -rf dist", "lint": "tsc --noEmit" }, "dependencies": { "@googl