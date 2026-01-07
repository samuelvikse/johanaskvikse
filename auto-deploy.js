#!/usr/bin/env node

/**
 * AUTO-DEPLOY SCRIPT
 * Automatically commits and pushes changes to GitHub
 * Run this script after making changes through the admin panel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCommand(command, options = {}) {
    try {
        const output = execSync(command, {
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return output;
    } catch (error) {
        console.error(`Error executing: ${command}`);
        console.error(error.message);
        if (!options.ignoreErrors) {
            process.exit(1);
        }
        return null;
    }
}

function getLatestVersion() {
    // Try to read version from git commit messages
    try {
        const latestCommit = execSync('git log -1 --pretty=%B', { encoding: 'utf8' });
        const versionMatch = latestCommit.match(/v(\d+\.\d+)/);
        if (versionMatch) {
            return versionMatch[1];
        }
    } catch (error) {
        // Ignore errors
    }
    return '1.01';
}

function main() {
    console.log('🚀 Auto-Deploy Script Starting...\n');

    // Check if we're in a git repository
    const gitStatus = executeCommand('git status --porcelain', { silent: true, ignoreErrors: true });

    if (gitStatus === null) {
        console.error('❌ Not a git repository or git is not installed');
        process.exit(1);
    }

    // Check if there are changes
    if (!gitStatus || gitStatus.trim() === '') {
        console.log('✅ No changes to commit');
        process.exit(0);
    }

    console.log('📝 Changes detected:\n');
    executeCommand('git status --short');

    // Get version
    const version = getLatestVersion();
    const nextVersion = (parseFloat(version) + 0.01).toFixed(2);

    // Add all changes
    console.log('\n📦 Adding changes...');
    executeCommand('git add .');

    // Create commit message
    const commitMessage = `Update website - v${nextVersion}

🤖 Generated with Claude Code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`;

    // Commit changes
    console.log('\n💾 Committing changes...');
    executeCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`);

    // Push to remote
    console.log('\n🚀 Pushing to GitHub...');
    executeCommand('git push');

    console.log(`\n✅ Successfully deployed version ${nextVersion}!`);
}

main();
