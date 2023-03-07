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
  if (Reflect.hasMetadata('__starfire_tracked', component)) {
    Reflect.getMetadata('__starfire_tracked', component).forEach((trackedProp: string) => {
      TIMELINE.on.change(Object.getOwnPropertyDescriptor(component, trackedProp)?.value, renderFunc)
    })
  }
}


export function fallback(target: Object, propertyKey?: PropertyKey): void {
  setMetadata(StarfireMetadata.fallback, target, propertyKey)
}


export async function renderFallback(component: any): Promise<HTMLElement | null> {
  let fallback
  if (Reflect.hasMetadata('__starfire_fallback', component)) {
    Reflect.getMetadata('__starfire_fallback', component).forEach((fallbackComponent: string)=> {
      fallback = Object.getOwnPropertyDescriptor(component, fallbackComponent)?.value
    })
    if (fallback) {
      render(fallback)
      return await observeDomNodeInsertion(component.id)
    }
  }
  return Promise.resolve(null)
}


export function observeDomNodeInsertion(id: string): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    const observer = new MutationObserver(muts => {
      if (document.getElementById(id)) {
        resolve(document.getElementById(id))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {childList: true, subtree: true})
  })
}
