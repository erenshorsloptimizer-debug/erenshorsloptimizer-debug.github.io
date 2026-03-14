// uiRenderer.js
// This file ONLY handles displaying things on screen

// Helper function (private - not exported)
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id "${id}" not found`);
    }
    return element;
}

// ==================== EXPORTED FUNCTIONS ====================

function showMessage(message, isWarning = false) {
    const msgElement = document.createElement('div');
    msgElement.style.position = 'fixed';
    msgElement.style.top = '20px';
    msgElement.style.right = '20px';
    msgElement.style.padding = '1rem';
    msgElement.style.background = isWarning ? '#fff3cd' : '#f8d7da';
    msgElement.style.color = isWarning ? '#856404' : '#721c24';
    msgElement.style.border = `1px solid ${isWarning ? '#ffeeba' : '#f5c6cb'}`;
    msgElement.style.borderRadius = '4px';
    msgElement.style.zIndex = '9999';
    msgElement.style.maxWidth = '300px';
    msgElement.textContent = message;

    document.body.appendChild(msgElement);

    setTimeout(() => {
        msgElement.remove();
    }, 5000);
}

function renderClassBar(classes, activeClass) {
    console.log("renderClassBar called with:", classes, activeClass);

    const bar = getElement('class-bar');
    if (!bar) {
        showMessage("Couldn't find class-bar element", false);
        return;
    }

    bar.innerHTML = '';

    if (!classes || classes.length === 0) {
        bar.innerHTML = '<p class="note">No classes available</p>';
        return;
    }

    classes.forEach(className => {
        const button = document.createElement('button');
        button.className = `class-btn ${activeClass === className ? 'active' : ''}`;
        button.setAttribute('data-class', className);
        button.textContent = className;

        // Add click handler
        button.addEventListener('click', () => {
            // We'll handle this in script.js by dispatching an event
            document.dispatchEvent(new CustomEvent('classSelected', {
                detail: { className: className }
            }));
        });

        bar.appendChild(button);
    });
}

function renderClassDescription(description) {
    const descElement = getElement('class-desc');
    if (descElement) {
        descElement.textContent = description || 'Select a class to begin';
    }
}
function renderStatPriorities(statWeights) {
    console.log("renderStatPriorities called with:", statWeights);

    const panel = getElement('stat-tier-panel');
    if (!panel) {
        showMessage("Couldn't find stat-tier-panel element", false);
        return;
    }

    panel.innerHTML = '';

    // If no stat weights yet, show a message
    if (!statWeights || Object.keys(statWeights).length === 0) {
        panel.innerHTML = '<p class="note">Select a class to see stat priorities</p>';
        return;
    }

    // Convert weights to tiers
    // Find the highest weight value to base tiers on
    const weights = Object.values(statWeights);
    const maxWeight = Math.max(...weights);

    // Create tier labels based on percentage of max
    const tiers = [
        { label: 'S+', threshold: 0.95 },  // 95%+ of max
        { label: 'S', threshold: 0.85 },   // 85-94%
        { label: 'A', threshold: 0.70 },   // 70-84%
        { label: 'B', threshold: 0.50 },   // 50-69%
        { label: 'C', threshold: 0.30 },   // 30-49%
        { label: 'D', threshold: 0.15 },   // 15-29%
        { label: 'F', threshold: 0 }       // below 15%
    ];

    // Group stats by tier
    const statsByTier = {};
    tiers.forEach(tier => {
        statsByTier[tier.label] = [];
    });

    // Sort each stat into a tier
    Object.entries(statWeights).forEach(([statName, weight]) => {
        const ratio = weight / maxWeight;

        for (const tier of tiers) {
            if (ratio >= tier.threshold) {
                statsByTier[tier.label].push(statName);
                break;
            }
        }
    });

    // Render each tier that has stats
    tiers.forEach(tier => {
        const stats = statsByTier[tier.label];
        if (stats.length > 0) {
            const tierDiv = document.createElement('div');
            tierDiv.className = 'stat-tier';

            // Format stat names nicely
            const formattedStats = stats.map(stat => {
                // Convert "intelScaling" to "INT", "critChance" to "CRIT", etc.
                const statMap = {
                    'str': 'STR',
                    'dex': 'DEX',
                    'agi': 'AGI',
                    'end': 'END',
                    'int': 'INT',
                    'intelScaling': 'INT',
                    'wis': 'WIS',
                    'cha': 'CHA',
                    'res': 'RES',
                    'haste': 'HASTE',
                    'armor': 'ARMOR',
                    'crit': 'CRIT',
                    'critChance': 'CRIT',
                    'critDamage': 'CRIT DMG',
                    'physicality': 'PHYS',
                    'hardiness': 'HARDY',
                    'finesse': 'FINE',
                    'defense': 'DEF',
                    'arcanism': 'ARC',
                    'restoration': 'REST',
                    'mind': 'MIND'
                };
                return statMap[stat.toLowerCase()] || stat.toUpperCase();
            }).join(' · ');

            tierDiv.innerHTML = `
                <span class="tier-label">${tier.label}</span>
                <span class="tier-stats">${formattedStats}</span>
            `;
            panel.appendChild(tierDiv);
        }
    });
}
function renderProficiencies(proficiencies) {
    console.log("renderProficiencies called with:", proficiencies);

    const table = getElement('prof-table');
    if (!table) {
        showMessage("Couldn't find prof-table element", false);
        return;
    }

    table.innerHTML = '';

    if (!proficiencies || Object.keys(proficiencies).length === 0) {
        table.innerHTML = '<p class="note">No proficiency data available</p>';
        return;
    }

    // Create a table
    const tableElem = document.createElement('table');
    tableElem.style.width = '100%';
    tableElem.style.borderCollapse = 'collapse';

    // Add header
    tableElem.innerHTML = `
        <thead>
            <tr style="border-bottom:1px solid var(--border);">
                <th style="text-align:left; padding:8px 4px;">Proficiency</th>
                <th style="text-align:center; padding:8px 4px;">Base</th>
                <th style="text-align:center; padding:8px 4px;">Effect</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = tableElem.querySelector('tbody');

    // Format proficiency names nicely
    const profNames = {
        physicality: 'Physicality',
        hardiness: 'Hardiness',
        finesse: 'Finesse',
        defense: 'Defense',
        arcanism: 'Arcanism',
        restoration: 'Restoration',
        mind: 'Mind'
    };

    // Add each proficiency row
    Object.entries(proficiencies).forEach(([prof, value]) => {
        if (value > 0) {  // Only show proficiencies with points
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border-light)';

            // Determine what stat this proficiency boosts
            const boosts = {
                physicality: 'STR-based damage',
                hardiness: 'END (HP & mitigation)',
                finesse: 'DEX/AGI (crit/avoid)',
                defense: 'Armor & block',
                arcanism: 'INT (spell power)',
                restoration: 'Healing & mana',
                mind: 'WIS/CHA (utility)'
            };

            row.innerHTML = `
                <td style="padding:8px 4px; color:var(--text-bright)">${profNames[prof] || prof}</td>
                <td style="padding:8px 4px; text-align:center; font-weight:bold;">${value}</td>
                <td style="padding:8px 4px; color:var(--text-dim); font-size:0.8rem;">${boosts[prof] || 'Various effects'}</td>
            `;
            tbody.appendChild(row);
        }
    });

    table.appendChild(tableElem);
}
function toggleProficienciesPanel() {
    const panelBody = getElement('prof-panel-body');
    const chevron = getElement('prof-panel-chevron');

    if (!panelBody || !chevron) return;

    const isVisible = panelBody.style.display !== 'none';

    if (isVisible) {
        panelBody.style.display = 'none';
        chevron.textContent = '▶';
    } else {
        panelBody.style.display = 'block';
        chevron.textContent = '▼';
    }
}
function renderAscensions(ascensions, selectedAscensions = []) {
    console.log("renderAscensions called with:", ascensions?.length || 0, "ascensions");

    const container = getElement('asc-panel-inner');
    if (!container) {
        showMessage("Couldn't find asc-panel-inner element", false);
        return;
    }

    container.innerHTML = '';

    if (!ascensions || ascensions.length === 0) {
        container.innerHTML = '<p class="note">No ascensions available for this class</p>';
        return;
    }

    // Create a grid of ascension cards
    ascensions.forEach(asc => {
        const card = document.createElement('div');
        card.className = 'asc-card';
        card.setAttribute('data-asc-id', asc.id);

        // Format the stats bonus if available
        const statsBonus = asc.stats ? Object.entries(asc.stats)
            .filter(([_, val]) => val > 0)
            .map(([stat, val]) => `${stat}: +${val}%`)
            .join(', ') : '';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-weight:bold; color:var(--text-bright)">${asc.name || 'Unknown'}</span>
                <span style="color:var(--text-dim); font-size:0.75rem;">Rank ${asc.maxRank || 1}</span>
            </div>
            <p style="font-size:0.8rem; margin:4px 0; color:var(--text-dim);">${asc.description || ''}</p>
            ${statsBonus ? `<p style="font-size:0.7rem; margin:4px 0; color:#8bc34a;">${statsBonus}</p>` : ''}
            <div style="display:flex; gap:4px; margin-top:8px;">
                ${Array.from({ length: asc.maxRank || 1 }, (_, i) => `
                    <span class="rank-dot ${i === 0 ? 'filled' : ''}" 
                          style="width:12px; height:12px; border-radius:50%; background:${i === 0 ? 'var(--text-bright)' : 'var(--border)'}; display:inline-block;"></span>
                `).join('')}
            </div>
        `;

        container.appendChild(card);
    });
}
function toggleAscensionsPanel() {
    console.log("toggleAscensionsPanel called");

    const panelBody = getElement('asc-panel-body');
    const chevron = getElement('asc-panel-chevron');

    if (!panelBody || !chevron) {
        console.warn("Couldn't find ascension panel elements");
        return;
    }

    const isVisible = panelBody.style.display !== 'none';

    if (isVisible) {
        panelBody.style.display = 'none';
        chevron.style.transform = 'rotate(-90deg)';
        chevron.style.display = 'inline-block';
    } else {
        panelBody.style.display = 'block';
        chevron.style.transform = 'rotate(0deg)';
    }
}

// Make it available globally for the onclick in HTML
window.toggleProfPanel = toggleProficienciesPanel;
window.toggleAscPanel = toggleAscensionsPanel;
// Add more export functions as we go...
export {
    showMessage,
    renderClassBar,
    renderClassDescription,
    renderStatPriorities,
    renderProficiencies,
    renderAscensions,
    toggleAscensionsPanel
};