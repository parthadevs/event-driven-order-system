const { checkbox } = require('@inquirer/prompts');
const { execSync } = require('child_process');

const dockerContainers = [
    { name: 'postgres-auth', type: 'Database' },
    { name: 'postgres-orders', type: 'Database' },
    { name: 'postgres-inventory', type: 'Database' },
    { name: 'postgres-payment', type: 'Database' },
    { name: 'postgres-notification', type: 'Database' },
    { name: 'postgres-product', type: 'Database' },
    { name: 'redis', type: 'Cache' },
    { name: 'kafka-zookeeper', type: 'Kafka' },
    { name: 'kafka-broker', type: 'Kafka' },
    { name: 'rabbitmq', type: 'Message Broker' },
];

async function main() {
    try {
        const { checkbox } = await import('@inquirer/prompts');
        
        const selectedContainers = await checkbox({
            message: 'Select Docker containers to start (or leave empty to skip):',
            choices: dockerContainers.map((item) => ({
                name: `${item.name} [${item.type}]`,
                value: item.name,
            })),
            pageSize: 15,
        });

        if (selectedContainers.length > 0) {
            console.log(`\n🚀 Starting selected containers: ${selectedContainers.join(', ')}...\n`);
            try {
                execSync(`docker compose up -d ${selectedContainers.join(' ')}`, {
                    stdio: 'inherit',
                    shell: true,
                });
                console.log('\n✅ Containers are up and running!\n');
            } catch (error) {
                console.error('❌ Error starting docker containers. Make sure Docker is running.');
            }
        } else {
            console.log('\n⚠️ No containers selected. Skipping docker startup.\n');
        }

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();