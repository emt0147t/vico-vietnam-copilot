#!/usr/bin/env node

/**
 * 🚀 VICO Startup Launcher
 * Starts both Python embedding server AND Node.js backend
 * 
 * Usage:
 *   npm run start-all
 * 
 * Or manually:
 *   node start.js
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 VICO Intelligence Platform - Startup Launcher');
console.log('================================================\n');

// Determine Python executable (prefer venv)
const isWindows = process.platform === 'win32';
const venvPython = isWindows 
    ? path.join(__dirname, '.venv', 'Scripts', 'python.exe')
    : path.join(__dirname, '.venv', 'bin', 'python');

// Check if venv exists
const pythonExe = fs.existsSync(venvPython) ? venvPython : 'python';
console.log(`🐍 Using Python: ${pythonExe}`);

// ✅ Start Python embedding server
console.log('📥 Starting Python embedding server (port 5000)...');
const pythonProcess = spawn(pythonExe, [path.join(__dirname, 'services', 'embedding_server.py')], {
    stdio: 'inherit',
    shell: false,
    windowsHide: true
});

pythonProcess.on('error', (error) => {
    console.error('❌ Failed to start Python server:', error.message);
    console.log('   Make sure Python 3.8+ and sentence-transformers are installed:');
    console.log('   pip install sentence-transformers pyvi torch transformers flask\n');
});

// ✅ Start Node.js backend (with delay to let Python start)
setTimeout(() => {
    console.log('\n📦 Starting Node.js backend (port 3001)...\n');
    const nodeProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'server'], {
        stdio: 'inherit',
        cwd: __dirname,
        shell: true,
        windowsHide: true
    });

    nodeProcess.on('error', (error) => {
        console.error('❌ Failed to start Node backend:', error.message);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down servers...');
        pythonProcess.kill();
        nodeProcess.kill();
        process.exit(0);
    });
}, 3000);

console.log('💡 Tip: Open http://localhost:3000 in your browser once both servers start\n');
