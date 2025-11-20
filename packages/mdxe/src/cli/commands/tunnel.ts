/**
 * Tunnel Commands for mdxe
 *
 * Manage Cloudflare tunnels for local development
 */

import { Command } from 'commander'
import { getTunnelManager } from '../../tunnel/manager'
import chalk from 'chalk'

export function createTunnelCommand(): Command {
  const tunnel = new Command('tunnel')
    .description('Manage Cloudflare tunnels for local development')

  // tunnel start
  tunnel
    .command('start')
    .description('Start a new Cloudflare tunnel')
    .argument('[port]', 'Local port to tunnel', '3000')
    .option('-n, --name <name>', 'Tunnel name')
    .option('-s, --subdomain <subdomain>', 'Custom subdomain')
    .option('-d, --domain <domain>', 'Custom domain', 'mdxe.do')
    .action(async (port: string, options) => {
      try {
        const manager = getTunnelManager()
        const portNum = parseInt(port, 10)

        if (isNaN(portNum)) {
          console.error(chalk.red(`Invalid port: ${port}`))
          process.exit(1)
        }

        console.log(chalk.blue(`Starting tunnel for localhost:${portNum}...`))

        const config = await manager.start({
          port: portNum,
          name: options.name,
          subdomain: options.subdomain,
          domain: options.domain,
        })

        console.log(chalk.green('\n✓ Tunnel started successfully!\n'))
        console.log(chalk.bold('Tunnel Details:'))
        console.log(`  ${chalk.dim('ID:')}      ${config.id}`)
        console.log(`  ${chalk.dim('Name:')}    ${config.name}`)
        console.log(`  ${chalk.dim('Port:')}    ${config.port}`)
        console.log(`  ${chalk.dim('URL:')}     ${chalk.cyan(config.url)}`)
        console.log(`  ${chalk.dim('Status:')}  ${chalk.green(config.status)}`)
        console.log(`  ${chalk.dim('Created:')} ${new Date(config.createdAt).toLocaleString()}`)
        console.log()
        console.log(chalk.dim(`Access your local server at: ${chalk.cyan(config.url)}`))
        console.log(chalk.dim('Press Ctrl+C to stop the tunnel'))
        console.log()

        // Keep process alive
        process.stdin.resume()
      } catch (error) {
        console.error(chalk.red('Failed to start tunnel:'), error)
        process.exit(1)
      }
    })

  // tunnel stop
  tunnel
    .command('stop')
    .description('Stop a running tunnel')
    .argument('<tunnel-id>', 'Tunnel ID to stop')
    .action(async (tunnelId: string) => {
      try {
        const manager = getTunnelManager()

        console.log(chalk.blue(`Stopping tunnel: ${tunnelId}...`))

        await manager.stop(tunnelId)

        console.log(chalk.green('✓ Tunnel stopped successfully'))
      } catch (error) {
        console.error(chalk.red('Failed to stop tunnel:'), error)
        process.exit(1)
      }
    })

  // tunnel list
  tunnel
    .command('list')
    .description('List all tunnels')
    .option('-a, --all', 'Show all tunnels (including stopped)')
    .action(async (options) => {
      try {
        const manager = getTunnelManager()
        let tunnels = await manager.list()

        if (!options.all) {
          tunnels = tunnels.filter((t) => t.status === 'running')
        }

        if (tunnels.length === 0) {
          console.log(chalk.yellow('No tunnels found'))
          return
        }

        console.log(chalk.bold('\nTunnels:\n'))

        for (const tunnel of tunnels) {
          const statusColor =
            tunnel.status === 'running'
              ? chalk.green
              : tunnel.status === 'error'
              ? chalk.red
              : chalk.gray

          console.log(`${chalk.dim('ID:')}      ${tunnel.id}`)
          console.log(`${chalk.dim('Name:')}    ${tunnel.name}`)
          console.log(`${chalk.dim('Port:')}    ${tunnel.port}`)
          console.log(`${chalk.dim('URL:')}     ${chalk.cyan(tunnel.url || 'N/A')}`)
          console.log(`${chalk.dim('Status:')}  ${statusColor(tunnel.status)}`)
          console.log(`${chalk.dim('Created:')} ${new Date(tunnel.createdAt).toLocaleString()}`)

          if (tunnel.error) {
            console.log(`${chalk.dim('Error:')}   ${chalk.red(tunnel.error)}`)
          }

          console.log()
        }
      } catch (error) {
        console.error(chalk.red('Failed to list tunnels:'), error)
        process.exit(1)
      }
    })

  // tunnel cleanup
  tunnel
    .command('cleanup')
    .description('Clean up stopped tunnels')
    .action(async () => {
      try {
        const manager = getTunnelManager()

        console.log(chalk.blue('Cleaning up stopped tunnels...'))

        await manager.cleanup()

        console.log(chalk.green('✓ Cleanup complete'))
      } catch (error) {
        console.error(chalk.red('Failed to cleanup tunnels:'), error)
        process.exit(1)
      }
    })

  // tunnel info
  tunnel
    .command('info')
    .description('Show information about a tunnel')
    .argument('<tunnel-id>', 'Tunnel ID')
    .action(async (tunnelId: string) => {
      try {
        const manager = getTunnelManager()
        const tunnel = await manager.get(tunnelId)

        if (!tunnel) {
          console.log(chalk.yellow(`Tunnel not found: ${tunnelId}`))
          return
        }

        const statusColor =
          tunnel.status === 'running'
            ? chalk.green
            : tunnel.status === 'error'
            ? chalk.red
            : chalk.gray

        console.log(chalk.bold('\nTunnel Details:\n'))
        console.log(`${chalk.dim('ID:')}       ${tunnel.id}`)
        console.log(`${chalk.dim('Name:')}     ${tunnel.name}`)
        console.log(`${chalk.dim('Port:')}     ${tunnel.port}`)
        console.log(`${chalk.dim('URL:')}      ${chalk.cyan(tunnel.url || 'N/A')}`)
        console.log(`${chalk.dim('Status:')}   ${statusColor(tunnel.status)}`)
        console.log(`${chalk.dim('PID:')}      ${tunnel.pid || 'N/A'}`)
        console.log(`${chalk.dim('Created:')}  ${new Date(tunnel.createdAt).toLocaleString()}`)
        console.log(`${chalk.dim('Updated:')}  ${new Date(tunnel.updatedAt).toLocaleString()}`)

        if (tunnel.error) {
          console.log(`${chalk.dim('Error:')}    ${chalk.red(tunnel.error)}`)
        }

        console.log()
      } catch (error) {
        console.error(chalk.red('Failed to get tunnel info:'), error)
        process.exit(1)
      }
    })

  return tunnel
}
