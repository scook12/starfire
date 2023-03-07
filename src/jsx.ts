import { handleTracking, renderFallback } from "./metadata";
import { IComponent } from "./component"

function getRootElement() {
  // todo make this configurable?
  return document.getElementById('app')
}


async function renderElement(component: any, parentNode?: JSX.Element) {
  await renderFallback(component)
  const ElementFactory = async (component: IComponent) => await component.render()
  const node = document.getElementById(component.id)
  const child = await ElementFactory(component)
  if (!node) {
    if (parentNode) parentNode.appendChild(child)
    else getRootElement()?.appendChild(child)
  } else {
    node.replaceWith(child)
  }
  return child
}

export default function render(component: any, parentNode?: JSX.Element): void {
  handleTracking(component, () => renderElement(component, parentNode))
  renderElement(component, parentNode)
}
