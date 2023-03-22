import { observeDomNodeInsertion } from "./dom/observer";
import { handleTracking, getFallback } from "./metadata";


function getRootElement() {
  // todo make this configurable?
  return document.getElementById('app')
}

async function renderFallback(component: any): Promise<HTMLElement | null> {
  const fallback = getFallback(component)
  if (!fallback) return Promise.resolve(null)
  render(fallback)
  return await observeDomNodeInsertion(component.id)
}

async function renderElement(component: any, parentNode?: JSX.Element) {
  await renderFallback(component)
  const ElementFactory = async () => component.render()
  const node = document.getElementById(component.id)
  const child = await ElementFactory()
  if (!node) {
    if (parentNode) parentNode.appendChild(child)
    else getRootElement()?.appendChild(child)
  } else node.replaceWith(child)
  return child
}

export default function render(component: any, parentNode?: JSX.Element | HTMLElement): void {
  handleTracking(component, () => renderElement(component, parentNode))
  renderElement(component, parentNode)
}
