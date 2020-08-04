/* eslint-disable */

const { app } = require('electron')
const ChildProcess = require('child_process')
const path = require('path')
const fs = require('fs-extra')

// Check out https://github.com/electron/windows-installer#handling-squirrel-events
// for more information on squirrel events for windows

// Mostly taken from:
// https://github.com/electron/windows-installer/issues/251

/**
 * Handle squirrel installation events.  This function will stop the app
 * from funning if the app is being installed or updated
 */
function handleInstallationEvents() {
  if (require('electron-squirrel-startup')) app.quit()
  if (process.argv.length === 1) return

  const exeName = path.basename(process.execPath)
  const squirrelEvent = process.argv[1]

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName])

      setTimeout(app.quit, 1000)
      break

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName])

      setTimeout(app.quit, 1000)
      break

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit()
      break
  }
}

function spawnUpdate(args) {
  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))

  return spawn(updateDotExe, args)
}

function spawn(command, args) {
  try {
    let spawnedProcess = ChildProcess.spawn(command, args, { detached: true })
    return spawnedProcess
  } catch (error) {
    console.warn(error)
    return null
  }
}

module.exports = { handleInstallationEvents }
