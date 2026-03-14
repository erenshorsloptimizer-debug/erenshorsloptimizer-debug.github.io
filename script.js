// script.js - The main controller/entry point

// ==================== IMPORTS ====================
// Bring in the functions we need from other files
import {
    showMessage,
    renderClassBar,
    renderClassDescription,
    renderStatPriorities,
    renderProficiencies,
    renderAscensions,
    toggleAscensionsPanel
} from './uiRenderer.js';
import { getState, setClass } from './characterState.js';
import AscendencyData from './Ascendency_Data.js';
// We'll import more as we add them

// ==================== DATA ====================
// The real classes from the game (we could also import this from a data file later)
const ERENSHOR_CLASSES = [
    "Windblade", "Paladin", "Reaver", "Druid", "Stormcaller", "Arcanist"
];

// Class descriptions (from your older version)
const CLASS_DESCRIPTIONS = {
    Windblade: 'Dual-wield melee DPS. Primary stats: DEX (2:1 over STR), AGI. Aura: Presence of Vitheo grants DEX/AGI and Attack Speed.',
    Paladin: 'Tanky melee with heals. Primary stats: STR and END for survivability, with some INT/WIS for healing. Aura: Presence of Soluna grants STR/END.',
    Reaver: 'Dark melee DPS. Primary stats: STR for damage, END for sustain. Aura: Rising Shadows grants party-wide proc effects.',
    Druid: 'Nature caster/healer. Primary stats: INT and WIS for spells, AGI for some builds. Aura: Presence of Fernalla grants Lifesteal.',
    Stormcaller: 'Elemental caster DPS. Primary stats: INT for spell power, AGI from aura. Aura: Presence of Storms grants AGI and Magic Resist.',
    Arcanist: 'Pure magic DPS/utility. Primary stats: INT for damage, WIS and CHA for mana sustain. Aura: Presence of Brax grants INT/WIS/CHA.'
};
// Class stat weights (from your older version)
const CLASS_STAT_WEIGHTS = {
    Windblade: { dex: 10, str: 7, res: 1, agi: 4, end: 1, int: 0, wis: 0, cha: 0, haste: 8, armor: 0 },
    Paladin: { str: 8, end: 8, dex: 4, agi: 2, int: 3, wis: 3, cha: 1, res: 2, haste: 0, armor: 8 },
    Reaver: { str: 10, end: 6, dex: 4, agi: 3, int: 1, wis: 0, cha: 0, res: 1, haste: 8, armor: 8 },
    Druid: { int: 10, wis: 8, agi: 4, end: 3, str: 2, dex: 1, cha: 2, res: 8, haste: 0, armor: 0 },
    Stormcaller: { int: 10, agi: 6, wis: 5, dex: 2, end: 2, str: 1, cha: 2, res: 4, haste: 8, armor: 0 },
    Arcanist: { int: 10, wis: 7, cha: 5, end: 2, agi: 1, str: 0, dex: 0, res: 8, haste: 0, armor: 0 }
};
// Class base proficiencies (from your older version)
const CLASS_PROFICIENCIES = {
    Windblade: { physicality: 10, hardiness: 8, finesse: 12, defense: 6, arcanism: 8, restoration: 6, mind: 5 },
    Paladin: { physicality: 10, hardiness: 10, finesse: 12, defense: 6, arcanism: 6, restoration: 10, mind: 6 },
    Reaver: { physicality: 14, hardiness: 8, finesse: 12, defense: 4, arcanism: 8, restoration: 6, mind: 5 },
    Druid: { physicality: 5, hardiness: 10, finesse: 5, defense: 10, arcanism: 7, restoration: 10, mind: 5 },
    Stormcaller: { physicality: 6, hardiness: 6, finesse: 12, defense: 6, arcanism: 10, restoration: 6, mind: 6 },
    Arcanist: { physicality: 3, hardiness: 10, finesse: 3, defense: 3, arcanism: 14, restoration: 9, mind: 10 }
};
// Class ID to name mapping (based on usedBy values from Ascendency_Data.js)
const CLASS_ID_TO_NAME = {
    2: "Arcanist",      // Arcane Mastery, Cooldown Reduction, etc.
    // We'll discover the others from your debug output
};

// Debug: See all available class IDs
console.log("Available class IDs:", [...new Set(AscendencyData.map(asc => asc.usedBy))]);
// ==================== INITIALIZATION ====================
console.log("🚀 Sloptimizer initializing with modules...");

// Set up event listeners
function setupEventListeners() {
    // Listen for custom events from UI
    document.addEventListener('classSelected', (event) => {
        const className = event.detail.className;
        handleClassSelection(className);
    });
}

// Handle class selection

function handleClassSelection(className) {
    console.log(`Class selected: ${className}`);

    // 1. Update the state
    setClass(className);

    // 2. Get updated state
    const currentState = getState();

    // 3. Update the UI
    renderClassBar(ERENSHOR_CLASSES, className);
    renderClassDescription(CLASS_DESCRIPTIONS[className] || 'No description available');

    // Render stat priorities
    const statWeights = CLASS_STAT_WEIGHTS[className] || {};
    renderStatPriorities(statWeights);

    // Render proficiencies
    const proficiencies = CLASS_PROFICIENCIES[className] || {};
    renderProficiencies(proficiencies);

    // NEW: Render ascensions
    const ascensions = getAscensionsForClass(className);
    renderAscensions(ascensions);

    // 4. Show confirmation
    showMessage(`Switched to ${className}`, true);
}

function debugAscensions() {
    console.log("=== ASCENSION DEBUG ===");
    console.log("AscendencyData length:", AscendencyData?.length);
    console.log("First item:", AscendencyData?.[0]);

    // Group by usedBy
    const byClass = {};
    AscendencyData.forEach(asc => {
        const classId = asc.usedBy;
        if (!byClass[classId]) {
            byClass[classId] = [];
        }
        byClass[classId].push(asc.name);
    });

    console.log("Grouped by class ID:", byClass);
}
// Get ascensions for the current class
function getAscensionsForClass(className) {
    // Map class names to IDs (based on the debug output)
    const classIdMap = {
        "Windblade": 1,
        "Arcanist": 2,
        "Paladin": 3,
        "Reaver": 4,
        "Druid": 5,
        "Stormcaller": 6
    };

    const classId = classIdMap[className];
    if (!classId) {
        console.log(`No class ID mapping for ${className}`);
        return [];
    }

    // Get class-specific ascensions
    const classAscensions = AscendencyData.filter(asc => asc.usedBy === classId);

    // Get general ascensions (usedBy: 0) that are available to everyone
    const generalAscensions = AscendencyData.filter(asc => asc.usedBy === 0);

    // Combine them (class-specific first, then general)
    const allAscensions = [...classAscensions, ...generalAscensions];

    console.log(`Found ${classAscensions.length} class-specific + ${generalAscensions.length} general ascensions for ${className}`);
    console.log(`Total: ${allAscensions.length} ascensions`);

    return allAscensions;
}

// TEMPORARY DEBUG - add at the very bottom of script.js
console.log("🔍 DEBUG: Checking initialization...");
console.log("- DOM ready?", document.readyState);
console.log("- Class bar element:", document.getElementById('class-bar'));
console.log("- ERENSHOR_CLASSES:", ERENSHOR_CLASSES);
console.log("- renderClassBar type:", typeof renderClassBar);

// ==================== START THE APP ====================
function initializeApp() {
    console.log("Initializing app...");

    // Set up event listeners
    setupEventListeners();

    // Set default class (Paladin)
    handleClassSelection('Paladin');
}

// Start the app
initializeApp();