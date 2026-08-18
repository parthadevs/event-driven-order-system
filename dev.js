const { checkbox } = require('@inquirer/prompts');
const { execSync } = require('child_process');

const services = [
    'auth-service',
    'inventory-service',
    'notification-service',
    'order-service',
    'payment-service',
    'api-gateway',
];

async function main() {
    const selected = await checkbox({
        message: 'Select services to run:',
        choices: services.map((service) => ({
            name: service,
            value: service,
        })),
        pageSize: 10,
        required: true,
    });

    const commands = selected.map(
        (service) => `nest start ${service} --watch`
    );

    execSync(`concurrently ${commands.map((cmd) => `"${cmd}"`).join(' ')}`, {
        stdio: 'inherit',
        shell: true,
    });
}

main();