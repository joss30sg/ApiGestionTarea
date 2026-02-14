#!/usr/bin/env node

/**
 * Script para exponer la aplicación a través de un túnel público
 * Permite acceder desde datos móviles o redes externas
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.cyan('\n🌐 Iniciando servidor de túnel...\n'));

// Intentar con localtunnel
const tunnel = spawn('lt', ['--port', '8080', '--subdomain', 'tasksapp'], {
  stdio: 'inherit',
  shell: true
});

tunnel.on('error', (err) => {
  console.error(chalk.red(`❌ Error: ${err.message}`));
  console.log(chalk.yellow('\nIntenta instalar localtunnel globalmente:'));
  console.log(chalk.white('npm install -g localtunnel\n'));
});

tunnel.on('exit', (code) => {
  if (code !== 0) {
    console.error(chalk.red(`\n❌ El túnel se cerró con código: ${code}`));
  }
});

console.log(chalk.green('✅ Servidor de túnel activo'));
console.log(chalk.cyan('\n📱 URLs para acceder:'));
console.log(chalk.white('  • Aplicación: https://tasksapp.loca.lt'));
console.log(chalk.white('  • API: https://tasksapp.loca.lt/api/proxy/tasks'));
console.log(chalk.yellow('\n⚠️  Nota: Presiona Ctrl+C para detener\n'));
