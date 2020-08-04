const packager = require('electron-packager')
const fs = require('fs-extra')
const path = require('path')

const { fromRoot, getPaths, success } = require('./util')

// MAIN PROCESS
createExe()

async function createExe() {
  const {
    exeNameWithoutExt,
    exeDir,
    appName,
    appDir: desiredAppDir,
  } = await getPaths()

  const appPaths = await packager({
    dir: fromRoot(),
    out: exeDir,
    platform: 'win32',
    arch: 'x64',
    name: appName,
    executableName: exeNameWithoutExt,
    // I had to set this to avoid some stupid "path is too long" error when building the installer
    // See: https://github.com/electron/windows-installer/issues/219
    asar: true,
  })

  let defaultAppDir = appPaths[0]
  await fs.rename(defaultAppDir, desiredAppDir)
  success('Created EXE at: ' + desiredAppDir)

  await fs.copy(
    fromRoot('build'),
    path.join(desiredAppDir, 'resources', 'app', 'build')
  )

  success('Copied production React app into built electron app')
}
