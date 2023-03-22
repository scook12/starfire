export function observeDomNodeInsertion(id: string): Promise<HTMLElement | null> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('DOM node never inserted')), 4000)
    const observer = new MutationObserver(muts => {
      if (document.getElementById(id)) {
        clearTimeout(timeout)
        resolve(document.getElementById(id))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {childList: true, subtree: true})
  })
}