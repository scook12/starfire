import 'reflect-metadata'
import { IComponent } from "./component"
import { TIMELINE } from '@starbeam/universal';

export function track(target: Object, propertyKey?:PropertyKey): void {
  if (Reflect.hasMetadata('__starfire_tracked', target)) {
      Reflect.getMetadata('__starfire_tracked', target).push(propertyKey)
      console.log("added ", propertyKey, " to starfire tracker...")
  } else {
      Reflect.defineMetadata('__starfire_tracked', [propertyKey], target)
  }
}

export function handleTracking(component: IComponent, renderFunc: () => void) {
  if (Reflect.hasMetadata('__starfire_tracked', component)) {
    Reflect.getMetadata('__starfire_tracked', component).forEach((trackedProp: string) => {
      TIMELINE.on.change(Object.getOwnPropertyDescriptor(component, trackedProp)?.value, renderFunc)
    })
  }
}
