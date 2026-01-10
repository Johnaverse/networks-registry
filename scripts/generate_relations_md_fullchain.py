import json

def load_networks(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {net['id']: net for net in data.get('networks', [])}

def get_relation_chain(networks, start_id, kind):
    chain = [start_id]
    current = start_id
    visited = set()
    while True:
        net = networks.get(current)
        if not net or current in visited:
            break
        visited.add(current)
        rels = net.get('relations', [])
        next_id = None
        for rel in rels:
            if rel.get('kind') == kind:
                next_id = rel.get('network')
                break
        if next_id:
            chain.append(next_id)
            current = next_id
        else:
            break
    return chain

def main():
    import os
    base_dir = os.path.dirname(os.path.abspath(__file__))
    registry_path = os.path.join(base_dir, '..', 'public', 'TheGraphNetworksRegistry.json')
    networks = load_networks(registry_path)

    # testnetOf.md
    testnet_lines = []
    for net_id, net in networks.items():
        for rel in net.get('relations', []):
            if rel.get('kind') == 'testnetOf':
                testnet_lines.append(f"{net_id} -- testnetOf --> {rel.get('network')}")

    testnet_path = os.path.join(base_dir, '..', 'docs', 'testnetOf.md')
    with open(testnet_path, 'w', encoding='utf-8') as f:
        f.write("# testnetOf Relations\n\n")
        f.write("```markdown\n")
        for line in testnet_lines:
            f.write(line + "\n")
        f.write("```\n")

    # l2Of.md in tree style: each parent appears once, all L2s point to it
    # Build a mapping: parent_id -> [child_id, ...]
    parent_to_l2s = {}
    for net_id, net in networks.items():
        for rel in net.get('relations', []):
            if rel.get('kind') == 'l2Of':
                parent = rel.get('network')
                parent_to_l2s.setdefault(parent, []).append(net_id)

    l2of_path = os.path.join(base_dir, '..', 'docs', 'l2Of.md')
    with open(l2of_path, 'w', encoding='utf-8') as f:
        f.write("# l2Of Relations (Tree Chart)\n\n")
        f.write("This chart shows each network only once. All L2 networks point to their parent, making the hierarchy explicit and easy for both humans and AI to parse.\n\n")
        f.write("```mermaid\nflowchart TD\n")
        for parent, l2s in parent_to_l2s.items():
            for l2 in l2s:
                f.write(f"    {l2} -- l2Of --> {parent}\n")
        f.write("```\n")

if __name__ == "__main__":
    main()
