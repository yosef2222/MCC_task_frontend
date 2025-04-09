import {JSX, useState} from 'react';
import './TreeEditor.css';

type TreeNode = {
    id: number;
    name: string;
    children?: TreeNode[];
};

type FindNodeResult = {
    node: TreeNode;
    parent: TreeNode | null;
    nodes: TreeNode[];
} | null;

const initialTree: TreeNode[] = [
    {
        id: 1,
        name: 'Node 1',
        children: [
            {
                id: 2,
                name: 'Node 2',
                children: [
                    { id: 3, name: 'Node 3' },
                    { id: 4, name: 'Node 4' },
                    { id: 5, name: 'Node 5' },
                ],
            },
        ],
    },
];

let idCounter = 6;

function TreeEditor() {
    const [tree, setTree] = useState<TreeNode[]>(initialTree);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const findNode = (
        nodes: TreeNode[],
        id: number,
        parent: TreeNode | null = null
    ): FindNodeResult => {
        for (const node of nodes) {
            if (node.id === id) return { node, parent, nodes };
            if (node.children) {
                const result = findNode(node.children, id, node);
                if (result) return result;
            }
        }
        return null;
    };

    const updateTree = (
        nodes: TreeNode[],
        id: number,
        updater: (node: TreeNode) => TreeNode
    ): TreeNode[] => {
        return nodes.map((node) => {
            if (node.id === id) return updater(node);
            if (node.children) {
                return {
                    ...node,
                    children: updateTree(node.children, id, updater),
                };
            }
            return node;
        });
    };

    const addNode = () => {
        const name = prompt('Enter new node name:');
        if (!name) return;

        const newNode: TreeNode = { id: idCounter++, name };

        if (selectedId) {
            setTree((prev) =>
                updateTree(prev, selectedId, (node) => ({
                    ...node,
                    children: [...(node.children || []), newNode],
                }))
            );
        } else {
            // Add node at root
            setTree((prev) => [...prev, newNode]);
        }
    };


    const removeNode = () => {
        if (!selectedId) return;

        const removeRecursive = (nodes: TreeNode[], id: number): TreeNode[] =>
            nodes
                .filter((node) => node.id !== id)
                .map((node) =>
                    node.children
                        ? { ...node, children: removeRecursive(node.children, id) }
                        : node
                );

        setTree((prev) => removeRecursive(prev, selectedId));
        setSelectedId(null);
    };

    const editNode = () => {
        if (!selectedId) return;
        const name = prompt('Enter new name:');
        if (!name) return;
        setTree((prev) =>
            updateTree(prev, selectedId, (node) => ({ ...node, name }))
        );
    };

    const resetTree = () => {
        setTree(initialTree);
        setSelectedId(null);
        idCounter = 6;
    };

    const renderTree = (nodes: TreeNode[], level: number = 0): JSX.Element[] => {
        return nodes.map((node) => (
            <div
                key={node.id}
                className={`tree-node${selectedId === node.id ? ' selected' : ''}`}
                style={{ marginLeft: `${level * 20}px` }}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(node.id);
                }}
            >
                {node.name}
                {node.children && renderTree(node.children, level + 1)}
            </div>
        ));
    };

    return (
        <div className="tree-container">
            <h2 className="tree-title">Tree Editor</h2>

            <div
                className="tree-area"
                onClick={() => setSelectedId(null)} // Click outside to deselect
            >
                {renderTree(tree)}
            </div>

            <div className="tree-buttons">
                <button onClick={addNode}>Add</button>
                <button onClick={removeNode}>Remove</button>
                <button onClick={editNode}>Edit</button>
                <button onClick={resetTree}>Reset</button>
                <button onClick={() => setSelectedId(null)}>Deselect</button>
            </div>
        </div>
    );
}

export default TreeEditor;
