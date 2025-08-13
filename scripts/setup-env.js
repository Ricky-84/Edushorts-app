#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function generateSecretKey() {
  return crypto.randomBytes(64).toString('hex');
}

function createEnvFile() {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envExamplePath)) {
    log('Error: .env.example file not found!', 'red');
    process.exit(1);
  }
  
  if (fs.existsSync(envPath)) {
    log('Warning: .env file already exists. Skipping creation.', 'yellow');
    return;
  }
  
  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Replace placeholder JWT secret with a real one
  const jwtSecret = generateSecretKey();
  envContent = envContent.replace('your-super-secret-jwt-key-here', jwtSecret);
  
  // Write the .env file
  fs.writeFileSync(envPath, envContent);
  log('✓ Created .env file with generated JWT secret', 'green');
}

function checkPrerequisites() {
  log('Checking prerequisites...', 'blue');
  
  const prerequisites = [
    { command: 'node --version', name: 'Node.js' },
    { command: 'npm --version', name: 'NPM' },
    { command: 'docker --version', name: 'Docker' },
    { command: 'docker-compose --version', name: 'Docker Compose' }
  ];
  
  let allGood = true;
  
  prerequisites.forEach(prereq => {
    try {
      require('child_process').execSync(prereq.command, { stdio: 'pipe' });
      log(`✓ ${prereq.name} is installed`, 'green');
    } catch (error) {
      log(`✗ ${prereq.name} is not installed or not in PATH`, 'red');
      allGood = false;
    }
  });
  
  return allGood;
}

function displayNextSteps() {
  log('\n' + '='.repeat(50), 'bright');
  log('Environment setup complete!', 'green');
  log('='.repeat(50), 'bright');
  
  log('\nNext steps:', 'bright');
  log('1. Review and update the .env file with your actual credentials', 'yellow');
  log('2. Install dependencies:', 'yellow');
  log('   npm install', 'blue');
  log('   cd backend && npm install', 'blue');
  
  log('\n3. Set up external services:', 'yellow');
  log('   • Create AWS account and configure credentials', 'blue');
  log('   • Create OpenAI API account', 'blue');
  log('   • Set up Sentry for error tracking', 'blue');
  
  log('\n4. Start development environment:', 'yellow');
  log('   docker-compose up -d        # Start database and Redis', 'blue');
  log('   cd backend && npm run dev   # Start backend API', 'blue');
  log('   npm start                   # Start React Native metro', 'blue');
  
  log('\n5. Initialize database:', 'yellow');
  log('   cd backend && npm run db:push    # Push schema to database', 'blue');
  log('   cd backend && npm run db:seed    # Seed with initial data', 'blue');
  
  log('\nFor more details, check the README.md file', 'green');
}

function main() {
  log('EduShorts Development Environment Setup', 'bright');
  log('=====================================\n', 'bright');
  
  // Check prerequisites
  const prereqsOk = checkPrerequisites();
  if (!prereqsOk) {
    log('\nPlease install missing prerequisites and run this script again.', 'red');
    process.exit(1);
  }
  
  // Create environment file
  createEnvFile();
  
  // Display next steps
  displayNextSteps();
}

main();