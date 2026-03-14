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
function renderGearList(items) {
    console.log(`renderGearList called with ${items?.length || 0} items`);

    const gearList = document.getElementById('gear-list');
    const gearCount = document.getElementById('gear-count');

    if (!gearList) {
        console.error("gear-list element not found!");
        return;
    }

    // Update item count
    if (gearCount) {
        gearCount.textContent = `(${items?.length || 0} items)`;
    }

    // Clear the container
    gearList.innerHTML = '';

    if (!items || items.length === 0) {
        gearList.innerHTML = '<p class="note" style="padding:2rem; text-align:center;">No items match your filters</p>';
        return;
    }

    // Create a card for each item
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gear-card';

        // Format stats nicely
        const statsHtml = Object.entries(item.stats)
            .map(([stat, value]) => `<span class="gear-stat">${stat.toUpperCase()}: ${value}</span>`)
            .join('');

        // Add relic tag if applicable
        const relicTag = item.relic ? '<span class="relic-tag">✨ Relic</span>' : '';

        // Show quality versions if available
        const qualityHtml = `
            <div class="gear-qualities">
                ${item.blessed ? '<span class="quality-blessed">✦ Blessed</span>' : ''}
                ${item.godly ? '<span class="quality-godly">✦✦ Godly</span>' : ''}
            </div>
        `;

        // Convert slot to lowercase for consistency
        const slotKey = item.slot.toLowerCase();

        // Build the card HTML with an EQUIP BUTTON
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span class="gear-name">${item.name}</span>
                ${relicTag}
            </div>
            <div class="gear-slot-level">
                <span class="gear-slot">${item.slot}</span>
                <span class="gear-level">Lvl ${item.lvl}</span>
            </div>
            <div class="gear-stats">
                ${statsHtml || '<span class="note">No stats</span>'}
            </div>
            ${qualityHtml}
            <!-- THIS IS THE EQUIP BUTTON -->
            <button class="equip-btn" 
                    data-slot="${slotKey}" 
                    data-item-name="${item.name}"
                    data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
                ⚔️ Equip
            </button>
        `;

        // Add the card to the list
        gearList.appendChild(card);
    });

    console.log(`Created ${items.length} gear cards with equip buttons`);
}
// Toggle Gear Database
function toggleGearDatabase() {
    console.log("toggleGearDatabase called");

    const dbBody = document.getElementById('gear-db-body');
    const chevron = document.getElementById('gear-db-chevron');

    if (!dbBody || !chevron) return;

    const isVisible = dbBody.style.display !== 'none';

    if (isVisible) {
        dbBody.style.display = 'none';
        chevron.textContent = '▶';
        chevron.style.transform = 'rotate(0deg)';
    } else {
        dbBody.style.display = 'block';
        chevron.textContent = '▼';
        chevron.style.transform = 'rotate(90deg)';
    }
}
function renderCurrentGear(gear) {
    console.log("renderCurrentGear called with:", gear);

    const panel = document.getElementById('current-gear-panel');
    if (!panel) {
        showMessage("Couldn't find current-gear-panel", false);
        return;
    }

    panel.innerHTML = '';

    // Create header
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = '<h2>⚔️ Current Gear</h2>';
    panel.appendChild(header);

    // Create body
    const body = document.createElement('div');
    body.className = 'panel-body';

    // Check if any gear is equipped
    const hasGear = Object.values(gear).some(item => item !== null);

    if (!hasGear) {
        body.innerHTML = '<p class="note" style="padding:1rem; text-align:center;">No gear equipped. Click "Equip" on items in the database below.</p>';
        panel.appendChild(body);
        return;
    }

    // Define all gear slots in display order
    const slots = [
        { key: 'head', label: 'Head' },
        { key: 'neck', label: 'Neck' },
        { key: 'chest', label: 'Chest' },
        { key: 'back', label: 'Back' },
        { key: 'arms', label: 'Arms' },
        { key: 'hands', label: 'Hands' },
        { key: 'waist', label: 'Waist' },
        { key: 'legs', label: 'Legs' },
        { key: 'feet', label: 'Feet' },
        { key: 'wrist', label: 'Wrist' },
        { key: 'ring1', label: 'Ring 1' },
        { key: 'ring2', label: 'Ring 2' },
        { key: 'primary', label: 'Primary' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'aura', label: 'Aura' },
        { key: 'charm', label: 'Charm' }
    ];

    // Create a grid for gear slots
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    grid.style.gap = '10px';
    grid.style.padding = '10px';

    slots.forEach(slot => {
        const item = gear[slot.key];
        const slotDiv = document.createElement('div');
        slotDiv.className = 'gear-slot';
        slotDiv.style.background = 'var(--panel-bg-light)';
        slotDiv.style.border = '1px solid var(--border)';
        slotDiv.style.borderRadius = '4px';
        slotDiv.style.padding = '8px';

        if (item) {
            // Format stats for tooltip
            const statsHtml = item.stats ? Object.entries(item.stats)
                .map(([stat, val]) => `<span style="font-size:0.7rem; color:var(--text-dim); display:block;">${stat.toUpperCase()}: ${val}</span>`)
                .join('') : '';

            slotDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:var(--text-bright); font-size:0.8rem;">${slot.label}</span>
                    <button class="unequip-btn" data-slot="${slot.key}" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:1rem;">✕</button>
                </div>
                <div style="font-size:0.75rem; color:var(--text-bright); margin:4px 0;">${item.name}</div>
                ${statsHtml}
            `;
        } else {
            slotDiv.innerHTML = `
                <div style="font-weight:bold; color:var(--text-dim); font-size:0.8rem;">${slot.label}</div>
                <div style="font-size:0.7rem; color:var(--text-dim); font-style:italic;">Empty</div>
            `;
        }

        grid.appendChild(slotDiv);
    });

    body.appendChild(grid);
    panel.appendChild(body);
}

function renderLoadoutBuilder(loadout, totalDPS = 0) {
    console.log("renderLoadoutBuilder called with:", loadout);

    const panel = document.getElementById('loadout-builder-panel');
    if (!panel) {
        showMessage("Couldn't find loadout-builder-panel", false);
        return;
    }

    panel.innerHTML = '';

    // Create header
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = '<h2>📊 Optimized Loadout</h2>';
    panel.appendChild(header);

    // Create body
    const body = document.createElement('div');
    body.className = 'panel-body';

    // Check if loadout exists
    if (!loadout || Object.keys(loadout).length === 0) {
        body.innerHTML = '<p class="note" style="padding:1rem; text-align:center;">Click "Find Best Loadout" to see optimized gear recommendations.</p>';
        panel.appendChild(body);
        return;
    }

    // Show DPS if available
    if (totalDPS > 0) {
        const dpsDiv = document.createElement('div');
        dpsDiv.style.background = 'var(--panel-bg-light)';
        dpsDiv.style.border = '1px solid var(--border)';
        dpsDiv.style.borderRadius = '4px';
        dpsDiv.style.padding = '15px';
        dpsDiv.style.margin = '10px';
        dpsDiv.style.textAlign = 'center';
        dpsDiv.innerHTML = `
            <div style="font-size:0.8rem; color:var(--text-dim);">Estimated DPS</div>
            <div style="font-size:2rem; font-weight:bold; color:var(--text-bright);">${totalDPS.toFixed(1)}</div>
        `;
        body.appendChild(dpsDiv);
    }

    // List recommended gear
    const slots = [
        { key: 'head', label: 'Head' },
        { key: 'neck', label: 'Neck' },
        { key: 'chest', label: 'Chest' },
        { key: 'back', label: 'Back' },
        { key: 'arms', label: 'Arms' },
        { key: 'hands', label: 'Hands' },
        { key: 'waist', label: 'Waist' },
        { key: 'legs', label: 'Legs' },
        { key: 'feet', label: 'Feet' },
        { key: 'wrist', label: 'Wrist' },
        { key: 'ring1', label: 'Ring 1' },
        { key: 'ring2', label: 'Ring 2' },
        { key: 'primary', label: 'Primary' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'aura', label: 'Aura' },
        { key: 'charm', label: 'Charm' }
    ];

    const list = document.createElement('div');
    list.style.padding = '10px';

    slots.forEach(slot => {
        const item = loadout[slot.key];
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '8px';
        row.style.borderBottom = '1px solid var(--border-light)';

        if (item) {
            row.innerHTML = `
                <div>
                    <span style="color:var(--text-dim); font-size:0.7rem; width:60px; display:inline-block;">${slot.label}:</span>
                    <span style="color:var(--text-bright); font-size:0.8rem;">${item.name}</span>
                </div>
                <button class="quick-equip-btn" data-slot="${slot.key}" data-item-name="${item.name}" style="background:var(--panel-bg); border:1px solid var(--border); color:var(--text-dim); border-radius:4px; padding:2px 8px; font-size:0.7rem; cursor:pointer;">Equip</button>
            `;
        } else {
            row.innerHTML = `
                <div>
                    <span style="color:var(--text-dim); font-size:0.7rem; width:60px; display:inline-block;">${slot.label}:</span>
                    <span style="color:var(--text-dim); font-size:0.7rem; font-style:italic;">No recommendation</span>
                </div>
            `;
        }

        list.appendChild(row);
    });

    body.appendChild(list);
    panel.appendChild(body);
}
// Make it available globally for HTML onclick
window.toggleGearDb = toggleGearDatabase;

// Placeholder for resetWeights (you can implement this later)
window.resetWeights = function () {
    console.log("resetWeights called - to be implemented");
    showMessage("Reset weights feature coming soon!", true);
};

// Placeholder for setTier
window.setTier = function (tier) {
    console.log(`setTier called with: ${tier}`);
    showMessage(`Quality tier set to: ${tier}`, true);

    // Update active button UI
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tier-${tier}`)?.classList.add('active');
};
window.renderGearList = renderGearList;
window.showMessage = showMessage;
window.toggleGearDb = toggleGearDatabase;
window.resetWeights = window.resetWeights || function () { console.log("resetWeights called"); };
window.setTier = window.setTier || function (tier) { console.log("setTier called:", tier); };
window.toggleProfPanel = toggleProficienciesPanel;
window.toggleAscPanel = toggleAscensionsPanel;
// Placeholder for optimize button
window.optimizeAndScroll = function () {
    console.log("optimizeAndScroll called - to be implemented");
    showMessage("Optimizer coming soon!", true);
};
// Add more export functions as we go...
export {
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
};