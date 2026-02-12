
import fs from 'fs';
import path from 'path';

const FIGMA_TOKEN = 'figd_JTUk6i718lTvxirM3i1j5xAxGOmb73k5cWtZrubE';
const FILE_KEY = 'Q5MqMYXyG06zBB0RJpjtO8';
const NODE_ID = '1837:348'; // HopeUI Kit Frame ID

async function fetchUIKitData() {
  console.log(`Fetching data for node ${NODE_ID} from file ${FILE_KEY}...`);
  
  const url = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${NODE_ID}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    const outputPath = path.join(process.cwd(), 'figma_uikit_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${outputPath}`);
    
  } catch (error) {
    console.error('Error fetching Figma data:', error);
    process.exit(1);
  }
}

fetchUIKitData();
