import "./inject.css"
import { Editor, EDITORS } from "./types"
import { getOptions, debounce } from "./utils"

const run = async () => {
  const OPTIONS = await getOptions()

  function debug(...args: unknown[]) {
    // eslint-disable-next-line no-console
    if (OPTIONS.showDebugMessages) console.log.apply(null, ["[OPEN-IN-IDE EXTENSION]", ...args])
  }

  const EDITOR_OPENERS: {
    [e in Editor]: (repo: string, file: string, line?: string) => string
  } = {
    vscode: (repo: string, file: string, line?: string) => {
      const url = `vscode://file/${OPTIONS.localPathForRepositories}/${repo}/${file}:${line ?? "1"}`
      location.href = url
      return url
    },
    "vscode-wsl": (repo: string, file: string, line?: string) => {
      const url = `vscode://vscode-remote/wsl+Ubuntu/${OPTIONS.localPathForRepositories}/${repo}/${file}:${
        line ?? "1"
      }:1`
      location.href = url
      return url
    },
    vscodium: (repo: string, file: string, line?: string) => {
      const url = `vscodium://file/${OPTIONS.localPathForRepositories}/${repo}/${file}:${line ?? "1"}`
      location.href = url
      return url
    },
    "vscodium-wsl": (repo: string, file: string, line?: string) => {
      const url = `vscodium://vscode-remote/wsl+Ubuntu/${OPTIONS.localPathForRepositories}/${repo}/${file}:${
        line ?? "1"
      }:1`
      location.href = url
      return url
    },
    "vscode-insiders": (repo: string, file: string, line?: string) => {
      const url = `vscode-insiders://file/${OPTIONS.localPathForRepositories}/${repo}/${file}:${line ?? "1"}`
      location.href = url
      return url
    },
    "vscode-insiders-wsl": (repo: string, file: string, line?: string) => {
      const url = `vscode-insiders://vscode-remote/wsl+Ubuntu/${OPTIONS.localPathForRepositories}/${repo}/${file}:${
        line ?? "1"
      }:1`
      location.href = url
      return url
    },
    cursor: (repo: string, file: string, line?: string) => {
      const url = `cursor://file/${OPTIONS.localPathForRepositories}/${repo}/${file}:${line ?? "1"}`
      location.href = url
      return url
    },
    phpstorm: (repo: string, file: string, line?: string) => {
      const url = `phpstorm://open?file=${OPTIONS.localPathForRepositories}/${repo}/${file}&line=${line ?? "1"}`
      location.href = url
      return url
    },
    "intellij-idea": (repo: string, file: string, line?: string) => {
      const url = `idea://open?file=${OPTIONS.localPathForRepositories}/${repo}/${file}&line=${line ?? "1"}`
      location.href = url
      return url
    },
    webstorm: (repo: string, file: string, line?: string) => {
      const url = `webstorm://open?file=${OPTIONS.localPathForRepositories}/${repo}/${file}&line=${line ?? "1"}`
      location.href = url
      return url
    },
    goland: (repo: string, file: string, line?: string) => {
      const url = `goland://open?file=${OPTIONS.localPathForRepositories}/${repo}/${file}&line=${line ?? "1"}`
      location.href = url
      return url
    },
    clion: (repo: string, file: string, line?: string) => {
      const url = `clion://open?file=${OPTIONS.localPathForRepositories}/${repo}/${file}&line=${line ?? "1"}`
      location.href = url
      return url
    },
    "jetbrains-webserver": (repo: string, file: string, line?: string) => {
      const url = `http://localhost:63342/api/file?file=${OPTIONS.localPathForRepositories}/${repo}/${file}&line=${
        line ?? "1"
      }`
      fetch(url).catch(() => alert(`Unable to open the file.\nIs the built-in web server started on localhost:63342 ?`))
      return url
    },
  }

  const generateIconElement = (repo: string, file: string, lineNumber?: string | null) => {
    const editorIconSpanElement = document.createElement("span")
    const filename = file.split("/").pop() as string
    let iconTitle = `Open ${filename} in ${EDITORS[OPTIONS.defaultIde].name}`
    if (lineNumber) iconTitle = `${iconTitle} at line ${lineNumber}`
    editorIconSpanElement.title = iconTitle
    editorIconSpanElement.classList.add("open-in-ide-icon")

    const editorIconImgElement = document.createElement("img")
    editorIconImgElement.src = chrome.runtime.getURL(EDITORS[OPTIONS.defaultIde].getIcon(32))
    editorIconSpanElement.appendChild(editorIconImgElement)

    editorIconSpanElement.addEventListener("click", e => {
      e.preventDefault()
      const editorUrl = EDITOR_OPENERS[OPTIONS.defaultIde](repo, file, lineNumber ?? undefined)
      debug(`Opened ${editorUrl}`)
    })
    return editorIconSpanElement
  }

  const filePathRegExp = /.+\/([^/]+)\/(blob|tree)\/[^/]+\/(.*)/

  const addEditorIcons = () => {
    debug("Adding editor icons")

    let addedIconsCounter = 0

    // -------------------------------
    // repository content (files list)
    // -------------------------------

    if (OPTIONS.showIconInFileTree) {
      // New React-based file tree (target large-screen cells to avoid hidden duplicates)
      const reactFiles = document.querySelectorAll<HTMLAnchorElement>(
        ".react-directory-row-name-cell-large-screen .react-directory-truncate a[title]",
      )

      // Legacy file tree (pre-React GitHub UI)
      const legacyFiles = document.querySelectorAll(
        '[aria-labelledby="files"].js-navigation-container > .Box-row.js-navigation-item .css-truncate',
      )

      reactFiles.forEach(linkElement => {
        const parentEl = linkElement.closest(".react-directory-truncate")
        if (!parentEl) return
        if (parentEl.querySelector(".open-in-ide-icon")) return

        const fileUrl = linkElement.getAttribute("href")
        if (!fileUrl || !filePathRegExp.test(fileUrl)) return

        const pathInfo = filePathRegExp.exec(fileUrl)
        const repo = pathInfo?.[1]
        const file = pathInfo?.[3]
        if (!repo || !file) return

        const editorIconElement = generateIconElement(repo, file)
        editorIconElement.classList.add("open-in-ide-icon-file-explorer")

        parentEl.insertBefore(editorIconElement, linkElement.nextSibling)
        addedIconsCounter++
      })

      legacyFiles.forEach(fileElement => {
        if (fileElement.parentNode?.querySelector(".open-in-ide-icon")) return

        const fileUrl = fileElement.querySelector("a")?.getAttribute("href")
        if (!fileUrl || !filePathRegExp.test(fileUrl)) return

        const pathInfo = filePathRegExp.exec(fileUrl)
        const repo = pathInfo?.[1]
        const file = pathInfo?.[3]
        if (!repo || !file) return

        const editorIconElement = generateIconElement(repo, file)
        editorIconElement.classList.add("open-in-ide-icon-file-explorer")

        fileElement.parentNode?.insertBefore(editorIconElement, fileElement.nextSibling)
        addedIconsCounter++
      })
    }

    // --------------------------------------------
    // file links (files changed view & discussions)
    // --------------------------------------------

    if (OPTIONS.showIconOnFileBlockHeaders || OPTIONS.showIconOnLineNumbers) {
      const repo = window.location.href.split("/")[4]

      let viewType: "filesChanged" | "filesChangedReact" | "discussion" = "filesChanged"

      // select file blocks — try legacy files changed view first
      let primaryLinks = document.querySelectorAll<HTMLAnchorElement>(".file a.Link--primary[title]")

      if (!primaryLinks.length) {
        // try discussion view
        primaryLinks = document.querySelectorAll<HTMLAnchorElement>(".js-comment-container a.Link--primary.text-mono")
        if (primaryLinks.length) {
          viewType = "discussion"
        }
      }

      if (!primaryLinks.length) {
        // try React-based files changed view (new GitHub UI)
        primaryLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="#diff-"].Link--primary')
        if (primaryLinks.length) {
          viewType = "filesChangedReact"
        }
      }

      primaryLinks.forEach(linkElement => {
        const file = (linkElement.title || linkElement.innerText)
          .replace(/[\u200E\u200F\u200B\u200C\u200D\uFEFF]/g, "") // strip invisible Unicode marks
          .split("→") // when file was renamed
          .pop()
          ?.trim()

        // no file found
        if (!file) return

        let lineNumberForFileBlock

        if (viewType === "discussion") {
          const fileElement = linkElement.closest(".js-comment-container")
          if (fileElement) {
            const lineNumberNodes = fileElement.querySelectorAll("td[data-line-number]")
            if (lineNumberNodes.length === 0) return // resolved comment with no lines
            lineNumberForFileBlock = lineNumberNodes[lineNumberNodes.length - 1].getAttribute("data-line-number")
          }
        } else if (viewType === "filesChanged") {
          const fileElement = linkElement.closest(".file")
          if (fileElement) {
            const firstLineNumberNode = fileElement.querySelector(
              "td.blob-num-deletion[data-line-number], td.blob-num-addition[data-line-number]",
            )
            lineNumberForFileBlock = firstLineNumberNode?.getAttribute("data-line-number")
          }
        }
        // filesChangedReact: line numbers not easily accessible from the header, skip for now

        if (OPTIONS.showIconOnFileBlockHeaders && !linkElement.parentNode?.querySelector(".open-in-ide-icon")) {
          const editorIconElement = generateIconElement(repo, file, lineNumberForFileBlock)

          if (viewType === "filesChanged") {
            // Insert inside the Truncate span, inline with the file name
            editorIconElement.classList.add("open-in-ide-icon-file-header")
            linkElement.parentNode?.insertBefore(editorIconElement, linkElement.nextSibling)
          } else if (viewType === "filesChangedReact") {
            // React-based diff view — insert after the file name link
            editorIconElement.classList.add("open-in-ide-icon-file-header")
            linkElement.parentNode?.insertBefore(editorIconElement, linkElement.nextSibling)
          } else {
            linkElement.parentNode?.insertBefore(editorIconElement, null)
          }
          addedIconsCounter++
        }

        // add icon on each line number (legacy views only)
        if (OPTIONS.showIconOnLineNumbers && viewType !== "filesChangedReact") {
          const fileElement = linkElement.closest(viewType === "filesChanged" ? ".file" : ".js-comment-container")
          if (fileElement) {
            const clickableLineNumbersNodes = fileElement.querySelectorAll("td.blob-num[data-line-number]")

            clickableLineNumbersNodes.forEach(lineNumberNode => {
              if (lineNumberNode.querySelector(".open-in-ide-icon")) return

              const lineNumber = lineNumberNode.getAttribute("data-line-number")
              const editorIconElement = generateIconElement(repo, file, lineNumber)

              lineNumberNode.classList.add("js-open-in-ide-icon-added")
              lineNumberNode.appendChild(editorIconElement)
              addedIconsCounter++
            })
          }
        }
      })
    }

    debug(`Added ${addedIconsCounter} new editor icons`)
  }

  // observe content changes
  const observeChanges = () => {
    debug("Observing page changes")

    const content = document.querySelector(".repository-content")

    if (content)
      pageChangeObserver.observe(content, {
        childList: true,
        subtree: true,
      })
  }

  // inject CSS rules for GitHub elements
  const styleNode = document.createElement("style")

  if (OPTIONS.showIconOnLineNumbers)
    // hide file numbers on hover
    styleNode.innerHTML += `tr:hover > td.js-open-in-ide-icon-added::before {
      display: none;
    }`

  document.head.appendChild(styleNode)

  // set up an observer
  const pageChangeObserver = new MutationObserver(function (mutations) {
    mutations.forEach(
      debounce(function (mutation: MutationRecord) {
        // prevent recursive mutation observation
        if ((mutation.target as Element).querySelector(":scope > .open-in-ide-icon")) return
        debug("Detected page changes:")
        debug(mutation.target)
        addEditorIcons()
        observeChanges()
      }),
    )
  })

  addEditorIcons()
  observeChanges()

  // observe route change
  pageChangeObserver.observe(document.head, {
    childList: true,
  })
}

void run()
