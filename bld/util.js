const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

function fromRoot(...paths) {
  return path.join(__dirname, '..', ...paths)
}

function success(text) {
  console.log(chalk.green(text))
}

async function getPaths() {
  let pkg = await fs.readJson(fromRoot('package.json'))
  let outDir = fromRoot('install')

  // Note this CANNOT have dashes in it, or the installer will fail to build
  // See: https://github.com/electron/windows-installer/issues/187
  let appName = pkg.productName

  let exeDir = path.join(outDir, 'exe')
  let appDir = path.join(exeDir, appName)

  let exeNameWithoutExt = appName
  let exeNameWithExt = appName + '.exe'
  let exePath = path.join(appDir, exeNameWithExt)

  let tmpManifestPath = path.join(outDir, 'manifest.xml')

  let installerDir = path.join(outDir, 'installer')

  return {
    exeDir,
    appName,
    appDir,
    exeNameWithExt,
    exeNameWithoutExt,
    exePath,
    installerDir,
    tmpManifestPath,
  }
}

module.exports = { fromRoot, success, getPaths }
