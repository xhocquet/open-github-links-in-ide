const path = require("path")

module.exports = on => {
  on("before:browser:launch", (browser, launchOptions) => {
    const extPath = path.join(__dirname, `../../dist/${browser.name}`)
    launchOptions.extensions.push(extPath)
    return launchOptions
  })
}
