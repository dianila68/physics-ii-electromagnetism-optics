import type { SceneData } from './types.js';

// Scene (de)serialization. Kept separate from the World so the same
// JSON format can be produced/consumed by any future engine or tooling.

export function serializeScene(scene: SceneData): string {
  return JSON.stringify(scene, null, 2);
}

export function parseScene(json: string): SceneData {
  const data = JSON.parse(json) as SceneData;
  if (typeof data !== 'object' || data === null || !Array.isArray(data.entities)) {
    throw new Error('Invalid scene: missing entities array');
  }
  if (!Array.isArray(data.links)) data.links = [];
  if (typeof data.version !== 'number') data.version = 1;
  return data;
}

export function downloadScene(scene: SceneData, filename = 'physics-scene.json'): void {
  const blob = new Blob([serializeScene(scene)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
