#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createSketch() {
    try {
        // Get sketch name
        const sketchName = await question('Enter sketch name: ');
        const sketchDir = path.join('sketches', sketchName.toLowerCase());

        // Create directories
        await fs.mkdir(sketchDir, { recursive: true });

        // Create sketch file
        await fs.writeFile(
            path.join(sketchDir, `${sketchName.toLowerCase()}.js`),
            ''
        );

        // Get snippets
        const snippetsInput = await question('Enter snippets (comma-separated): ');
        const snippets = snippetsInput.split(',').map(s => s.trim());

        // Get descriptions
        const descriptions = [];
        let description;
        console.log('Enter descriptions (empty line to finish):');
        while ((description = await question('Description: ')) !== '') {
            descriptions.push(description);
        }

        // Get params
        const params = {};
        console.log('Enter parameter names (empty line to finish):');
        let paramName;
        while ((paramName = await question('Parameter name: ')) !== '') {
            params[paramName.toLowerCase()] = {
                name: paramName,
                type: "number",
                min: 0,
                max: 10,
                step: 0.1,
                value: 5
            };
        }

        // Create settings.json
        const settings = {
            libraries: ["p5"],
            script: `${sketchName.toLowerCase()}.js`,
            snippets,
            title: `WCCC - ${sketchName}`,
            description: descriptions,
            params
        };

        await fs.writeFile(
            path.join(sketchDir, 'settings.json'),
            JSON.stringify(settings, null, 4)
        );

        // Update sketches.json
        let sketches = { sketches: [] };
        try {
            const sketchesData = await fs.readFile('sketches.json', 'utf8');
            sketches = JSON.parse(sketchesData);
        } catch (error) {
            // If sketches.json doesn't exist, we'll create it
            console.log('Creating new sketches.json file');
        }

        sketches.sketches.push({
            name: sketchName,
            description: `WCCC ${sketchName}`,
            directory: sketchName.toLowerCase()
        });

        await fs.writeFile(
            'sketches.json',
            JSON.stringify(sketches, null, 4)
        );

        console.log(`Sketch "${sketchName}" created successfully!`);
        rl.close();
    } catch (error) {
        console.error('Error creating sketch:', error);
        rl.close();
    }
}

createSketch();