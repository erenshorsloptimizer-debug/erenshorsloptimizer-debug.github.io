// script.js - The main controller/entry point

// ==================== IMPORTS ====================
import {
    showMessage,
    renderClassBar,
    renderClassDescription,
    renderStatPriorities,
    renderProficiencies,
    renderAscensions,
    toggleAscensionsPanel,
    renderGearList,
    toggleGearDatabase,
    renderCurrentGear,
    renderLoadoutBuilder,
} from './uiRenderer.js';

import {
    getState,
    setClass,
    setFilterMinLevel,
    setFilterMaxLevel,
    setFilterSearch,
    setFilterSlot,
    getFilters
} from './characterState.js';

import AscendencyData from './Ascendency_Data.js';

// ==================== DATA ====================
const ERENSHOR_CLASSES = [
    "Windblade", "Paladin", "Reaver", "Druid", "Stormcaller", "Arcanist"
];

const CLASS_DESCRIPTIONS = {
    Windblade: 'Dual-wield melee DPS. Primary stats: DEX (2:1 over STR), AGI. Aura: Presence of Vitheo grants DEX/AGI and Attack Speed.',
    Paladin: 'Tanky melee with heals. Primary stats: STR and END for survivability, with some INT/WIS for healing. Aura: Presence of Soluna grants STR/END.',
    Reaver: 'Dark melee DPS. Primary stats: STR for damage, END for sustain. Aura: Rising Shadows grants party-wide proc effects.',
    Druid: 'Nature caster/healer. Primary stats: INT and WIS for spells, AGI for some builds. Aura: Presence of Fernalla grants Lifesteal.',
    Stormcaller: 'Elemental caster DPS. Primary stats: INT for spell power, AGI from aura. Aura: Presence of Storms grants AGI and Magic Resist.',
    Arcanist: 'Pure magic DPS/utility. Primary stats: INT for damage, WIS and CHA for mana sustain. Aura: Presence of Brax grants INT/WIS/CHA.'
};

const CLASS_STAT_WEIGHTS = {
    Windblade: { dex: 10, str: 7, res: 1, agi: 4, end: 1, int: 0, wis: 0, cha: 0, haste: 8, armor: 0 },
    Paladin: { str: 8, end: 8, dex: 4, agi: 2, int: 3, wis: 3, cha: 1, res: 2, haste: 0, armor: 8 },
    Reaver: { str: 10, end: 6, dex: 4, agi: 3, int: 1, wis: 0, cha: 0, res: 1, haste: 8, armor: 8 },
    Druid: { int: 10, wis: 8, agi: 4, end: 3, str: 2, dex: 1, cha: 2, res: 8, haste: 0, armor: 0 },
    Stormcaller: { int: 10, agi: 6, wis: 5, dex: 2, end: 2, str: 1, cha: 2, res: 4, haste: 8, armor: 0 },
    Arcanist: { int: 10, wis: 7, cha: 5, end: 2, agi: 1, str: 0, dex: 0, res: 8, haste: 0, armor: 0 }
};

const CLASS_PROFICIENCIES = {
    Windblade: { physicality: 10, hardiness: 8, finesse: 12, defense: 6, arcanism: 8, restoration: 6, mind: 5 },
    Paladin: { physicality: 10, hardiness: 10, finesse: 12, defense: 6, arcanism: 6, restoration: 10, mind: 6 },
    Reaver: { physicality: 14, hardiness: 8, finesse: 12, defense: 4, arcanism: 8, restoration: 6, mind: 5 },
    Druid: { physicality: 5, hardiness: 10, finesse: 5, defense: 10, arcanism: 7, restoration: 10, mind: 5 },
    Stormcaller: { physicality: 6, hardiness: 6, finesse: 12, defense: 6, arcanism: 10, restoration: 6, mind: 6 },
    Arcanist: { physicality: 3, hardiness: 10, finesse: 3, defense: 3, arcanism: 14, restoration: 9, mind: 10 }
};

const CLASS_ID_TO_NAME = {
    1: "Windblade",
    2: "Arcanist",
    3: "Paladin",
    4: "Reaver",
    5: "Druid",
    6: "Stormcaller"
};

// ==================== GLOBAL VARIABLES ====================
let gearData = [];  // Will be populated dynamically

// ==================== FUNCTIONS ====================

// Get ascensions for the current class
function getAscensionsForClass(className) {
    const classIdMap = {
        "Windblade": 1,
        "Arcanist": 2,
        "Paladin": 3,
        "Reaver": 4,
        "Druid": 5,
        "Stormcaller": 6
    };

    const classId = classIdMap[className];
    if (!classId) return [];

    const classAscensions = AscendencyData.filter(asc => asc.usedBy === classId);
    const generalAscensions = AscendencyData.filter(asc => asc.usedBy === 0);

    return [...classAscensions, ...generalAscensions];
}

// Load gear data with cache busting
async function loadGearData() {
    try {
        const module = await import(`./gear-data.js?v=${Date.now()}`);
        gearData = module.gearData;
        console.log(`✅ Loaded ${gearData.length} gear items`);
        return true;
    } catch (error) {
        console.error("Failed to load gear data:", error);
        showMessage("Failed to load gear database", false);
        return false;
    }
}
setTimeout(() => {
    // Test current gear
    const testGear = {
        head: { name: "Test Helm", stats: { str: 5, dex: 3 } },
        chest: { name: "Test Chest", stats: { str: 8, end: 5 } },
        primary: { name: "Test Sword", stats: { str: 12, dex: 4 } },
        ring1: { name: "Test Ring", stats: { int: 6, wis: 3 } }
    };
    renderCurrentGear(testGear);

    // Test loadout
    const testLoadout = {
        head: { name: "Optimized Helm", stats: { str: 8, dex: 5 } },
        chest: { name: "Optimized Chest", stats: { str: 12, end: 8 } },
        primary: { name: "Optimized Sword", stats: { str: 18, dex: 6 } },
        ring1: { name: "Optimized Ring", stats: { int: 10, wis: 5 } }
    };
    renderLoadoutBuilder(testLoadout, 1250.5);
}, 500);

// Filter gear based on current settings
function filterGearForCurrentClass() {
    if (!gearData || gearData.length === 0) {
        console.log('⏳ Gear data not loaded yet');
        return [];
    }

    const currentState = getState();
    const filters = getFilters();
    const currentClass = currentState.className;

    const filtered = gearData.filter(item => {
        if (!item.classes || !item.classes.includes(currentClass)) return false;
        if (item.lvl < filters.minLevel || item.lvl > filters.maxLevel) return false;
        if (filters.searchText && !item.name.toLowerCase().includes(filters.searchText)) return false;
        if (filters.slot !== 'All' && filters.slot !== '' && item.slot !== filters.slot) return false;
        return true;
    });

    return filtered;
}

// Handle filter changes
function onFilterChange() {
    if (!gearData || gearData.length === 0) return;
    const filteredGear = filterGearForCurrentClass();
    renderGearList(filteredGear);
}

// Set up filter listeners
function setupFilterListeners() {
    const minInput = document.getElementById('filter-level-min');
    const maxInput = document.getElementById('filter-level');
    const searchInput = document.getElementById('filter-name');
    const slotSelect = document.getElementById('filter-slot');

    if (minInput) minInput.addEventListener('input', (e) => {
        setFilterMinLevel(parseInt(e.target.value) || 1);
        onFilterChange();
    });

    if (maxInput) maxInput.addEventListener('input', (e) => {
        setFilterMaxLevel(parseInt(e.target.value) || 35);
        onFilterChange();
    });

    if (searchInput) searchInput.addEventListener('input', (e) => {
        setFilterSearch(e.target.value);
        onFilterChange();
    });

    if (slotSelect) slotSelect.addEventListener('change', (e) => {
        setFilterSlot(e.target.value);
        onFilterChange();
    });
}

// Set up event listeners
function setupEventListeners() {
    document.addEventListener('classSelected', (event) => {
        handleClassSelection(event.detail.className);
    });
}

// Handle class selection
function handleClassSelection(className) {
    console.log(`Class selected: ${className}`);

    setClass(className);
    const currentState = getState();

    // Update ALL UI components
    renderClassBar(ERENSHOR_CLASSES, className);
    renderClassDescription(CLASS_DESCRIPTIONS[className] || 'No description available');
    renderStatPriorities(CLASS_STAT_WEIGHTS[className] || {});
    renderProficiencies(CLASS_PROFICIENCIES[className] || {});
    renderAscensions(getAscensionsForClass(className));

    // Update gear if loaded
    if (gearData && gearData.length > 0) {
        const filteredGear = filterGearForCurrentClass();
        renderGearList(filteredGear);
    }

    showMessage(`Switched to ${className}`, true);
}

// ==================== INITIALIZATION ====================
console.log("🚀 Sloptimizer initializing with modules...");

async function initializeApp() {
    console.log("Initializing app...");

    setupEventListeners();
    setupFilterListeners();

    await loadGearData();
    handleClassSelection('Paladin');

    showMessage("✅ Sloptimizer fully loaded!", true);
}

// Start the app
initializeApp();

// Debug info
console.log("🔍 DEBUG: Checking initialization...");
console.log("- DOM ready?", document.readyState);
console.log("- Class bar element:", document.getElementById('class-bar'));
console.log("- ERENSHOR_CLASSES:", ERENSHOR_CLASSES);
console.log("- renderClassBar type:", typeof renderClassBar);