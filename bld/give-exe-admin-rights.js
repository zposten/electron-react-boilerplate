// Most of the know how for this script was borrowed from:
// https://www.authentise.com/post/electron-and-uac-on-windows

const fs = require('fs-extra')
const chalk = require('chalk')
const execa = require('execa')

const { fromRoot, success, getPaths } = require('./util')

// Path to Windows manifest tool
// See: https://docs.microsoft.com/en-us/windows/win32/sbscs/mt-exe
// Windows 10 SDK can be downloaded here:
// https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk/
const mt =
  'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x64\\mt.exe'

// MAIN PROCESS
giveExeAdminRights()

async function giveExeAdminRights() {
  let { exePath } = await getPaths()
  let manifestPath = fromRoot('dist', 'manifest.xml')

  try {
    await ensureExeExists(exePath)
    await extractManifest(exePath, manifestPath)
    await changeExecutionLevel(manifestPath)
    await reInsertManifest(exePath, manifestPath)
    await deleteManifestFile(manifestPath)
  } catch (e) {
    console.log(chalk.red(e.message))
    process.exit(1)
  }
}

async function ensureExeExists(exePath) {
  let exists = await fs.pathExists(exePath)
  if (!exists) {
    throw new Error(
      'EXE must be created before it can be given admin permissions.  Missing: ' +
        exePath
    )
  }
}

/** Extract the manifest file that is hidden within the EXE */
async function extractManifest(exePath, manifestPath) {
  try {
    await execa(mt, [`-inputresource:${exePath}`, `-out:${manifestPath}`])
    success('Extracted manifest file from EXE')
  } catch (e) {
    throw new Error(
      'Failed to extract manifest file from EXE: \n\n' + e.message
    )
  }
}

/**
 * The default requested execution level within the manifest file is "asInvoker".
 * We need the application to request admin rights from the user when it starts up,
 * so we change that to "requireAdministrator".
 */
async function changeExecutionLevel(manifestPath) {
  let manifestBuffer = await fs.readFile(manifestPath)
  let manifestContents = manifestBuffer.toString()

  let withAdmin = manifestContents.replace(/asInvoker/, 'requireAdministrator')
  await fs.writeFile(manifestPath, withAdmin)

  success('Successfully added admin privileges to manifest file')
}

/**
 * Now that the manifest has been modified to have admin privileges, lets
 * put that modified manifest back into the EXE
 */
async function reInsertManifest(exePath, manifestPath) {
  try {
    await execa(mt, [`-manifest`, manifestPath, `-outputresource:${exePath}`])
    success('Re-inserted modified manifest file into EXE')
  } catch (e) {
    throw new Error(
      'Failed to re-insert modified manifest file into EXE: \n\n' + e.message
    )
  }
}

/**
 * In order to modify the manifest file stored within the EXE file, it first
 * had to be extracted and placed onto the file system.  Once the manifest is
 * re-inserted into the EXE, there is no purpose to leaving the manifest on
 * the file system, so let's delete it.
 */
async function deleteManifestFile(manifestPath) {
  try {
    await fs.remove(manifestPath)
    success('Cleaned up manifest file')
  } catch (e) {
    throw new Error('Failed to clean up manifest file: \n\n' + e.message)
  }
}
