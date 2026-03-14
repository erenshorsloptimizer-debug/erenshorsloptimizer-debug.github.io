const UI = {};

// Stat Weights Panel
UI.renderStatWeights = function (statWeights = window.statWeights) {
    const panel = document.getElementById('stat-tier-panel');
    if (!panel) return;

    const stats = [
        { key: 'strength', label: 'STR', short: 'Strength' },
        { key: 'dexterity', label: 'DEX', short: 'Finesse' },
        { key: 'agility', label: 'AGI', short: 'Agility' },
        { key: 'endurance', label: 'END', short: 'Toughness' },
        { key: 'intelligence', label: 'INT', short: 'Aptitude' },
        { key: 'wisdom', label: 'WIS', short: 'Spirit' },
        { key: 'charisma', label: 'CHA', short: 'Presence' },
        { key: 'armor', label: 'Armor', short: 'Protection' }
    ];

    const tiers = [
        { label: 'Primary', value: 2.0 },
        { label: 'Secondary', value: 1.0 },
        { label: 'Utility', value: 0.5 },
        { label: 'Off', value: 0.0 }
    ];

    let html = '';
    stats.forEach(stat => {
        const currentWeight = statWeights[stat.key] ?? 0;
        html += `<div class="stat-row">
            <div class="stat-label"><span>${stat.label}</span>${stat.short}</div>
            <div class="btn-row">`;
        tiers.forEach(t => {
            const isActive = currentWeight === t.value;
            html += `<button class="btn ${isActive ? 'btn-gold' : 'btn-ghost'}" onclick="updateStatWeight('${stat.key}', ${t.value})">${t.label}</button>`;
        });
        html += `</div></div>`;
    });

    panel.innerHTML = html;
};

// Ability Panel (simplified)
UI.renderAbilityPanel = function (abilities = window.abilityData) {
    const panel = document.getElementById('ability-panel-inner');
    if (!panel) return;

    let html = '';
    abilities.forEach(a => {
        html += `<div class="ability-card" title="${a.desc}">${a.name}</div>`;
    });
    panel.innerHTML = html;
};

// Optimize Panel (simplified)
UI.renderOptimizePanel = function () {
    const panel = document.getElementById('optimize-panel-body');
    if (!panel) return;

    panel.innerHTML = `
    <div>
      <button class="optimize-btn" onclick="optimizeAndScroll()">⚔ Find Best Loadout ⚔</button>
    </div>
    `;
};