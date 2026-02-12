
import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'figma_uikit_data.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// The structure is nodes -> "1837:348" -> document -> children
const rootNode = data.nodes['1837:348'].document;

console.log(`Root Node Name: ${rootNode.name}`);
console.log('Children:');

function listChildren(node, depth = 0) {
  if (!node.children || depth > 2) return;
  
  node.children.forEach(child => {
    console.log(`${'  '.repeat(depth)}- ${child.name} (Type: ${child.type}, ID: ${child.id})`);
    // Recurse a bit to see structure
    if (depth < 1) {
       listChildren(child, depth + 1);
    }
  });
}

listChildren(rootNode);
