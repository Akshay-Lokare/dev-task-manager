const path = require('node:path')
const rcedit = require('rcedit')

module.exports = async function afterPack(context) {
  const productFilename = context.packager.appInfo.productFilename
  const exePath = path.join(context.appOutDir, `${productFilename}.exe`)
  const iconPath = path.join(context.packager.projectDir, 'build', 'icon.ico')

  await rcedit(exePath, { icon: iconPath })
  console.log('Applied app icon:', exePath)
}
