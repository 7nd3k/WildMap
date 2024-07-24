// By 7nd3k (200k) !! https://github.com/7nd3k !!

import net from 'net';
import readline from 'readline';
import { execSync } from 'child_process';
import chalk from 'chalk';
import Table from 'cli-table3';
import figlet from 'figlet';

// Limpia la terminal
execSync(process.platform === 'win32' ? 'cls' : 'clear', { stdio: 'inherit' });

// Mostrar el texto figletizado "Wild"
figlet.text('Wild', {
    font: 'Slant'
}, function(err, data) {
    if (err) {
        console.log(chalk.red('Algo salió mal...'));
        console.dir(err);
        return;
    }
    console.log(chalk.green(data));
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(chalk.blue('\n>> Introduce la IP que deseas escanear: '), (targetIP) => {
        const startPort = 1;
        const endPort = 1024;
        const timeout = 2000; // Tiempo de espera en milisegundos

        let openPorts = [];

        process.on('SIGINT', () => {
            console.log(chalk.red('\nEscaneo cancelado por el usuario.'));
            displayResults();
            process.exit();
        });

        function scanPort(port) {
            return new Promise((resolve, reject) => {
                const socket = new net.Socket();

                socket.setTimeout(timeout);

                socket.on('connect', () => {
                    openPorts.push(port);
                    socket.destroy();
                    resolve(true);
                });

                socket.on('timeout', () => {
                    socket.destroy();
                    resolve(false);
                });

                socket.on('error', () => {
                    resolve(false);
                });

                socket.connect(port, targetIP);
            });
        }

        async function scanPorts() {
            console.log(chalk.yellow(`\n- Escaneando puertos del ${startPort} al ${endPort} en ${targetIP}...\n`));

            for (let port = startPort; port <= endPort; port++) {
                let isOpen = await scanPort(port);
                if (isOpen) {
                    console.log(chalk.green(`[*] Puerto ${port} está abierto`));
                }
            }

            console.log(chalk.yellow('\nEscaneo completo.\n'));
            displayResults();
            rl.close();
        }

        function displayResults() {
            if (openPorts.length === 0) {
                console.log(chalk.red('[x] No se encontraron puertos abiertos.'));
            } else {
                console.log(chalk.green('- Puertos abiertos encontrados:\n'));
                const table = new Table({
                    head: [chalk.blue('Puerto'), chalk.blue('Estado')],
                    colWidths: [10, 20]
                });

                openPorts.forEach(port => {
                    table.push([port, chalk.green('Abierto')]);
                });

                console.log(table.toString());
            }
        }

        scanPorts();
    });
});
