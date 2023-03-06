import { IComponent } from "./component"
import { TIMELINE } from '@starbeam/universal';

type Component = (props: any) => any

// any class that implements IComponent
type ComponentClass<IComponent, Args extends any[] = any[]> = new(...args: Args) => IComponent;
type AnyComponentClass = ComponentClass<IComponent, any[]>

function getRootElement() {
  return document.getElementById('app')
}

function isFunction(c: Function | Object) {
  try {
    if ("render" in c.prototype) {
      // is a class with a render method
      return false
    }
    // default to function
    return true 
  } catch (error) {
    // errors on checking prototype of arrow function declarations
    return true
  }
}

export function renderFunctionComponent(component: Component, nodeId?: string, props?: any): void {
  const node = document.getElementById(nodeId!)
  if (!node) {
    console.log(props)
    console.log(component(props))
    getRootElement()?.appendChild(component({...props}))
  } else {
    node.replaceWith(component(props))
  }
}

export function renderElement(component, factory) {
  const node = document.getElementById(component.id)
  if (!node) {
    // first render
    getRootElement()?.appendChild(factory(component))
  } else {
    node.replaceWith(factory(component))
  }
}


export function renderClassElement(c: AnyComponentClass, props?: any): void {
  const component = new c({...props})
  console.log(component.data)
  const ElementFactory = (component: IComponent) => component.render()

  const renderElement = () => {
    const node = document.getElementById(component.id)
    if (!node) {
      // first render
      getRootElement()?.appendChild(ElementFactory(component))
    } else {
      node.replaceWith(ElementFactory(component))
    }
  }

  component.dependencies.forEach(dep => TIMELINE.on.change(dep, renderElement))
  renderElement()
}

export default function render(component: any, nodeId?: string, props?: any): void {
  isFunction(component) ? 
    renderFunctionComponent(component, nodeId, props) :
    renderClassElement(component, props)
}