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

  // Note this CANNOT have dashes in it, or the installer will fail to build
  // See: https://github.com/electron/windows-installer/issues/187
  let appName = pkg.productName

  let exeDir = fromRoot('dist', 'exe')
  let appDir = path.join(exeDir, appName)

  let exeNameWithoutExt = appName
  let exeNameWithExt = appName + '.exe'
  let exePath = path.join(appDir, exeNameWithExt)

  let installerDir = fromRoot('dist', 'installer')

  return {
    exeDir,
    appName,
    appDir,
    exeNameWithExt,
    exeNameWithoutExt,
    exePath,
    installerDir,
  }
}

module.exports = { fromRoot, success, getPaths }
