// characterState.js
// This file holds the CURRENT state of the user's character

// The actual state object - this is PRIVATE (not exported)
const state = {
    className: 'Paladin',  // default class
    level: 35,
    gear: {
        head: null,
        neck: null,
        chest: null,
        back: null,
        arms: null,
        hands: null,
        waist: null,
        legs: null,
        feet: null,
        wrist: null,
        ring1: null,
        ring2: null,
        primary: null,
        secondary: null,
        aura: null,
        charm: null
    },
    proficiencies: {},
    ascensions: []
};

// PUBLIC functions - these are what other files can use
export function getState() {
    // Return a COPY so other files can't accidentally modify the original
    return JSON.parse(JSON.stringify(state));
}

export function setClass(className) {
    state.className = className;
    console.log(`Class set to: ${className}`);
}

export function setLevel(level) {
    state.level = level;
    console.log(`Level set to: ${level}`);
}

export function equipItem(slot, item) {
    if (state.gear.hasOwnProperty(slot)) {
        state.gear[slot] = item;
        console.log(`Equipped ${item?.name || 'nothing'} in ${slot}`);
    } else {
        console.warn(`Invalid slot: ${slot}`);
    }
}

export function unequipItem(slot) {
    if (state.gear.hasOwnProperty(slot)) {
        state.gear[slot] = null;
        console.log(`Unequipped ${slot}`);
    }
}

export function setProficiencies(profs) {
    state.proficiencies = profs;
}

export function setAscensions(ascensions) {
    state.ascensions = ascensions;
}