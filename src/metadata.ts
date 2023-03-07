import 'reflect-metadata'
import { IComponent } from "./component"
import { TIMELINE } from '@starbeam/universal';
import render from './jsx';


enum StarfireMetadata {
  tracked = "__starfire_tracked",
  fallback = "__starfire_fallback"
}


function setMetadata(metadata: string, target: Object, propertyKey?: PropertyKey): void {
  if (Reflect.hasMetadata(metadata, target))
    Reflect.getMetadata(metadata, target).push(propertyKey)
  else Reflect.defineMetadata(metadata, [propertyKey], target)
}


export function track(target: Object, propertyKey?:PropertyKey): void {
  setMetadata(StarfireMetadata.tracked, target, propertyKey)
}


export function handleTracking(component: IComponent, renderFunc: () => void) {
  if (!Reflect.hasMetadata(StarfireMetadata.tracked, component)) return
  Reflect.getMetadata(StarfireMetadata.tracked, component).forEach((trackedProp: string) => {
    const trackedValue = Object.getOwnPropertyDescriptor(component, trackedProp)?.value
    TIMELINE.on.change(trackedValue, renderFunc)
  })
}


export function fallback(target: Object, propertyKey?: PropertyKey): void {
  setMetadata(StarfireMetadata.fallback, target, propertyKey)
}


export async function renderFallback(component: any): Promise<HTMLElement | null> {
  if (!Reflect.hasMetadata(StarfireMetadata.fallback, component)) return Promise.resolve(null)
  const propKey = Reflect.getMetadata(StarfireMetadata.fallback, component)[0]
  const fallback = Object.getOwnPropertyDescriptor(component, propKey)?.value
  render(fallback)
  return await observeDomNodeInsertion(component.id)
}


function observeDomNodeInsertion(id: string): Promise<HTMLElement | null> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('DOM node never inserted')), 20000)
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
