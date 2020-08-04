const electronInstaller = require('electron-winstaller')
const chalk = require('chalk')

const { getPaths, success } = require('./util')

async function createWindowsInstaller() {
  const {
    appDir,
    installerDir,
    exeNameWithExt,
    exeNameWithoutExt,
  } = await getPaths()

  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: appDir,
      exe: exeNameWithExt,
      outputDirectory: installerDir,
      authors: 'Carlo Consulting',
      name: exeNameWithoutExt,
    })

    success('Installer successfully created!!')
  } catch (e) {
    console.error(chalk.red('Failed to create installer'))
    console.error(e)
    process.exit(1)
  }
}

createWindowsInstaller()
