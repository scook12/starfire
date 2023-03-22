import 'reflect-metadata'
import { TIMELINE } from '@starbeam/universal';


export enum StarfireMetadata {
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


export function handleTracking(component: any, renderFunc: () => void) {
  if (!Reflect.hasMetadata(StarfireMetadata.tracked, component)) return
  Reflect.getMetadata(StarfireMetadata.tracked, component).forEach((trackedProp: string) => {
    const trackedValue = Object.getOwnPropertyDescriptor(component, trackedProp)?.value
    TIMELINE.on.change(trackedValue, renderFunc)
  })
}


export function fallback(target: Object, propertyKey?: PropertyKey): void {
  setMetadata(StarfireMetadata.fallback, target, propertyKey)
}


export function getFallback(component: any): null | any {
  if (!Reflect.hasMetadata(StarfireMetadata.fallback, component)) return null
  const propKey = Reflect.getMetadata(StarfireMetadata.fallback, component)[0]
  return Object.getOwnPropertyDescriptor(component, propKey)?.value
}
