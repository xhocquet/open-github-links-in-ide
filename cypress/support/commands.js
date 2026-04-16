Cypress.Commands.add("waitForNetworkIdle", () => {
  cy.window().then(window => new Cypress.Promise(resolve => window.requestIdleCallback(resolve)))
})

// Inject the extension's content script and CSS into the page
// since MV3 extensions don't inject into Cypress's AUT iframe
Cypress.Commands.add("injectExtension", () => {
  cy.readFile("dist/chrome/inject.css").then(css => {
    cy.document().then(doc => {
      const style = doc.createElement("style")
      style.textContent = css
      doc.head.appendChild(style)
    })
  })

  cy.readFile("dist/chrome/inject.js").then(js => {
    cy.window().then(win => {
      // Mock chrome extension APIs
      if (!win.chrome) win.chrome = {}
      if (!win.chrome.storage) {
        win.chrome.storage = {
          sync: {
            get: (defaults, callback) => callback(defaults),
            set: (_items, callback) => {
              if (callback) callback()
            },
          },
        }
      }
      if (!win.chrome.runtime) {
        win.chrome.runtime = {
          getURL: path => path,
          getManifest: () => ({ manifest_version: 3 }),
        }
      }

      // Execute the content script
      win.eval(js)
    })
  })
})
