import { handleTracking } from "./metadata";
import { IComponent } from "./component"

function getRootElement() {
  // todo make this configurable?
  return document.getElementById('app')
}

export default function render(component: any, parentNode?: JSX.Element): void {
  const ElementFactory = (component: IComponent) => component.render()

  const renderElement = () => {
    const node = document.getElementById(component.id)
    if (!node) {
      if (parentNode) parentNode.appendChild(ElementFactory(component))
      else getRootElement()?.appendChild(ElementFactory(component))
    } else {
      node.replaceWith(ElementFactory(component))
    }
  }

  handleTracking(component, renderElement)
  renderElement()
}
