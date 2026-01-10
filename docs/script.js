document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the registry data
        const response = await fetch('https://raw.githubusercontent.com/graphprotocol/networks-registry/refs/heads/main/public/TheGraphNetworksRegistry.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const networks = data.networks || [];

        // Prepare elements for Cytoscape
        const nodes = [];
        const edges = [];

        networks.forEach(net => {
            // Add Node
            nodes.push({
                data: {
                    id: net.id,
                    label: net.id, // Using ID as label per request
                    fullName: net.fullName,
                    networkType: net.networkType,
                    nativeToken: net.nativeToken || 'N/A',
                    caip2Id: net.caip2Id || 'N/A'
                }
            });

            // Process Relations
            if (net.relations && Array.isArray(net.relations)) {
                net.relations.forEach(rel => {
                    if (rel.kind === 'l2Of' || rel.kind === 'testnetOf' || rel.kind === 'beaconOf') {
                        edges.push({
                            data: {
                                source: net.id,
                                target: rel.network,
                                type: rel.kind
                            }
                        });
                    }
                });
            }
        });

        // Initialize Cytoscape
        const cy = cytoscape({
            container: document.getElementById('cy'),

            elements: {
                nodes: nodes,
                edges: edges
            },

            style: [
                // CORE STYLES
                {
                    selector: 'node',
                    style: {
                        'background-color': '#444',
                        'label': 'data(label)',
                        'color': '#fff',
                        'font-size': '12px',
                        'font-family': 'Inter, sans-serif',
                        'text-valign': 'bottom',
                        'text-margin-y': 6,
                        'text-background-color': '#000',
                        'text-background-opacity': 0.5,
                        'text-background-padding': '2px',
                        'text-background-shape': 'roundrectangle',
                        'width': 20,
                        'height': 20
                    }
                },
                {
                    selector: 'node[networkType = "mainnet"]',
                    style: {
                        'background-color': '#6f4cff',
                        'width': 24,
                        'height': 24,
                        'text-outline-color': '#6f4cff',
                        'text-outline-width': 0
                    }
                },
                {
                    selector: 'node[networkType = "testnet"]',
                    style: {
                        'background-color': '#00d395',
                        'width': 16,
                        'height': 16
                    }
                },
                // CL Nodes
                {
                    selector: 'node[id $= "-cl"]',
                    style: {
                        'background-color': '#ffaa00',
                        'width': 16,
                        'height': 16
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#555',
                        'target-arrow-color': '#555',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.6
                    }
                },
                {
                    selector: 'edge[type = "l2Of"]',
                    style: {
                        'line-color': '#6f4cff',
                        'target-arrow-color': '#6f4cff',
                        'width': 2
                    }
                },
                {
                    selector: 'edge[type = "testnetOf"]',
                    style: {
                        'line-color': '#00d395',
                        'target-arrow-color': '#00d395',
                        'line-style': 'dashed',
                        'line-dash-pattern': [6, 3],
                        'width': 1
                    }
                },
                {
                    selector: 'edge[type = "beaconOf"]',
                    style: {
                        'line-color': '#ffaa00',
                        'target-arrow-color': '#ffaa00',
                        'line-style': 'dotted',
                        'width': 2
                    }
                },
                // INTERACTION STATES
                {
                    selector: ':selected',
                    style: {
                        'border-width': 2,
                        'border-color': '#fff'
                    }
                },
                // FILTERING STATES
                {
                    selector: '.hidden',
                    style: {
                        'display': 'none'
                    }
                }
            ],

            layout: {
                name: 'dagre',
                rankDir: 'BT', // Bottom to Top (Children at bottom, Parents at top)
                padding: 50,
                spacingFactor: 1.2,
                nodeDimensionsIncludeLabels: true,
                animate: true,
                animationDuration: 500
            },

            minZoom: 0.1,
            maxZoom: 3,
            wheelSensitivity: 0.2
        });

        // Filter & Layout Logic
        const filters = {
            l2: document.getElementById('filter-l2'),
            testnet: document.getElementById('filter-testnet'),
            beacon: document.getElementById('filter-beacon')
        };
        const layoutSelect = document.getElementById('layout-select');

        function getLayoutConfig(name) {
            const baseConfig = {
                animate: true,
                animationDuration: 500,
                nodeDimensionsIncludeLabels: true,
                padding: 50
            };

            switch (name) {
                case 'dagre':
                    return {
                        ...baseConfig,
                        name: 'dagre',
                        rankDir: 'BT', // Bottom-to-Top as requested
                        spacingFactor: 1.2
                    };
                case 'breadthfirst':
                    return {
                        ...baseConfig,
                        name: 'breadthfirst',
                        directed: true,
                        spacingFactor: 1.2,
                        avoidOverlap: true
                    };
                case 'circle':
                    return {
                        ...baseConfig,
                        name: 'circle',
                        avoidOverlap: true
                    };
                case 'concentric':
                    return {
                        ...baseConfig,
                        name: 'concentric',
                        minNodeSpacing: 50,
                        avoidOverlap: true
                    };
                case 'grid':
                    return {
                        ...baseConfig,
                        name: 'grid',
                        avoidOverlap: true
                    };
                case 'cose':
                    return {
                        ...baseConfig,
                        name: 'cose',
                        idealEdgeLength: 100,
                        nodeOverlap: 20,
                        refresh: 20,
                        fit: true,
                        padding: 30,
                        randomize: false,
                        componentSpacing: 100,
                        nodeRepulsion: 400000,
                        edgeElasticity: 100,
                        nestingFactor: 5,
                        gravity: 80,
                        numIter: 1000,
                        initialTemp: 200,
                        coolingFactor: 0.95,
                        minTemp: 1.0
                    };
                default:
                    return { ...baseConfig, name: 'dagre', rankDir: 'BT' };
            }
        }

        function updateFilters() {
            cy.batch(() => {
                const showL2 = filters.l2.checked;
                const showTestnet = filters.testnet.checked;
                const showBeacon = filters.beacon.checked;

                // Handle L2 Edges
                cy.edges('[type = "l2Of"]').forEach(edge => {
                    if (showL2) edge.removeClass('hidden');
                    else edge.addClass('hidden');
                });

                // Handle Testnet Edges
                cy.edges('[type = "testnetOf"]').forEach(edge => {
                    if (showTestnet) edge.removeClass('hidden');
                    else edge.addClass('hidden');
                });

                // Handle Beacon Edges
                cy.edges('[type = "beaconOf"]').forEach(edge => {
                    if (showBeacon) edge.removeClass('hidden');
                    else edge.addClass('hidden');
                });
            });

            // Re-run layout on visible elements + all nodes
            const visibleElements = cy.elements().not('.hidden');
            const layoutName = layoutSelect.value;
            const layoutConfig = getLayoutConfig(layoutName);

            // Add eles to config
            layoutConfig.eles = visibleElements;

            cy.layout(layoutConfig).run();
        }

        Object.values(filters).forEach(checkbox => {
            checkbox.addEventListener('change', updateFilters);
        });

        if (layoutSelect) {
            layoutSelect.addEventListener('change', updateFilters);
        }

        // Add event listeners for Tooltip
        const tooltip = document.getElementById('tooltip');

        cy.on('mouseover', 'node', (evt) => {
            const node = evt.target;
            const data = node.data();

            // Populate Tooltip
            tooltip.innerHTML = `
                <h3>${data.label}</h3>
                <p><strong>ID:</strong> ${data.id}</p>
                <p><strong>Type:</strong> ${data.networkType}</p>
                <p><strong>CAIP2:</strong> ${data.caip2Id}</p>
                <p><strong>Token:</strong> ${data.nativeToken}</p>
            `;

            tooltip.classList.remove('hidden');
            tooltip.classList.add('active');
        });

        cy.on('mouseout', 'node', () => {
            tooltip.classList.remove('active');
        });

        cy.on('mousemove', (evt) => {
            // Position tooltip near cursor
            const x = evt.originalEvent.clientX;
            const y = evt.originalEvent.clientY;

            // Offset
            tooltip.style.left = (x + 15) + 'px';
            tooltip.style.top = (y + 15) + 'px';
        });

    } catch (error) {
        console.error('Failed to load registry:', error);
        document.getElementById('app').innerHTML += `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:red; background:rgba(0,0,0,0.8); padding:20px;">Error loading data: ${error.message}</div>`;
    }
});
