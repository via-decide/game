You are working in repository via-decide/Game on branch main.

MISSION
Implement a low-level graphics pipeline called via-game-render to interface directly with the GPU. 1. Create src/core/graphics/. 2. Implement RenderDevice.ts to abstract WebGPU or Vulkan initialization, swap chains, and command buffers. 3. Create ShaderCompiler.ts to compile WGSL or SPIR-V shaders at runtime for materials and lighting. 4. Implement MeshBuffer.ts to upload Vertex and Index data directly to GPU VRAM. 5. Build a ForwardPlusRenderer.ts (or Deferred Renderer) to handle complex scene lighting, grouping light data into a tiled compute shader to support hundreds of dynamic lights. 6. Implement an InstancingEngine.ts to render thousands of identical objects (like grass or asteroids) in a single draw call.

CONSTRAINTS
Minimize state changes and draw calls. Batch transparent and opaque geometry separately, and ensure vertex data is interleaved correctly for the GPU input assembler.

PROCESS (MANDATORY)
1. Read README.md and AGENTS.md before editing.
2. Audit architecture before coding. Summarize current behavior.
3. Preserve unrelated working code. Prefer additive modular changes.
4. Implement the smallest safe change set for the stated goal.
5. Run validation commands and fix discovered issues.
6. Self-review for regressions, missing env wiring, and docs drift.
7. Return complete final file contents for every modified or created file.

REPO AUDIT CONTEXT
- Description: Game 
- Primary language: TypeScript
- README snippet:
# VIA - Bharat's Social Platform 🇮🇳 VIA is a next-generation social platform designed for digital explorers navigating Bharat's social landscape. Discover, create, and deep dive into the stories that matter. ## 🚀 Features - **Dynamic Feed**: Real-time social feed with high-quality content. - *

- AGENTS snippet:
not found


SOP: PRE-MODIFICATION PROTOCOL (MANDATORY)
1. Adherence to Instructions: No deviations without explicit user approval.
2. Mandatory Clarification: Immediately ask if instructions are ambiguous or incomplete.
3. Proposal First: Always propose optimizations or fixes before implementing them.
4. Scope Discipline: Do not add unrequested features or modify unrelated code.
5. Vulnerability Check: Immediately flag and explain security risks.

OUTPUT REQUIREMENTS
- Include: implementation summary, checks run, risks, rollback notes.
- Generate branch + PR package.
- Keep prompts deterministic and preservation-first.