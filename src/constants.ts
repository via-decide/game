import { PlantStage, Tool } from './types';

export const PLANT_STAGES: PlantStage[] = [
  { threshold: 0, name: 'Dormant Seed', color: '#5D4037', maxWater: 30, maxNutrients: 100 },
  { threshold: 25, name: 'Sprout', color: '#388E3C', maxWater: 50, maxNutrients: 100 },
  { threshold: 80, name: 'Sapling', color: '#43A047', maxWater: 80, maxNutrients: 120 },
  { threshold: 180, name: 'Young Tree', color: '#2E7D32', maxWater: 120, maxNutrients: 150 },
  { threshold: 400, name: 'Mature Tree', color: '#1B5E20', maxWater: 200, maxNutrients: 200 },
];

export const INITIAL_UPGRADES = {
  waterEfficiency: 1.0,
  nutrientRetention: 1.0,
  stressResistance: 0,
  pestDefense: 0,
};

export const INITIAL_TOOLS: Tool[] = [
  {
    id: 'watering-can',
    name: 'Advanced Watering Can',
    description: 'Increases hydration efficiency by 15% per level.',
    level: 0,
    maxLevel: 5,
    baseCost: 100,
    costMultiplier: 1.5,
    type: 'passive',
    bonusType: 'water',
    bonusValue: 0.15,
  },
  {
    id: 'soil-tester',
    name: 'Digital Soil Tester',
    description: 'Reduces nutrient drain by 10% per level.',
    level: 0,
    maxLevel: 5,
    baseCost: 150,
    costMultiplier: 1.6,
    type: 'passive',
    bonusType: 'nutrients',
    bonusValue: 0.1,
  },
  {
    id: 'pest-control',
    name: 'Automated Pest Control',
    description: 'Reduces pest infestation chance by 20% per level.',
    level: 0,
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.8,
    type: 'passive',
    bonusType: 'pests',
    bonusValue: 0.2,
  },
  {
    id: 'stress-monitor',
    name: 'Stress Monitor',
    description: 'Reduces stress build-up from research by 1 per level.',
    level: 0,
    maxLevel: 5,
    baseCost: 120,
    costMultiplier: 1.4,
    type: 'passive',
    bonusType: 'stress',
    bonusValue: 1,
  },
  {
    id: 'data-extractor',
    name: 'Data Extractor',
    description: 'Increases credit gain from research by 2 per level.',
    level: 0,
    maxLevel: 5,
    baseCost: 180,
    costMultiplier: 1.7,
    type: 'passive',
    bonusType: 'credits',
    bonusValue: 2,
  }
];

export const SHOP_ITEMS = [
  { id: 'compost', name: 'Compost', cost: 15, nut: 40, stress: 0, type: 'fertilizer' },
  { id: 'synthetic', name: 'Synthetic', cost: 25, nut: 80, stress: 15, type: 'fertilizer' },
  { id: 'organic', name: 'Organic Premium', cost: 50, nut: 100, stress: -20, type: 'fertilizer' },
  { id: 'neem', name: 'Neem Oil', cost: 15, kills: 1, stress: 0, type: 'pesticide' },
  { id: 'chemical', name: 'Chemical Spray', cost: 25, kills: 5, stress: 15, type: 'pesticide' },
];
