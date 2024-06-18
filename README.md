# Starfire

A lightweight framework for writing reactive JSX with Starbeam.

## Status

The framework is still a WIP, no usage or packages available yet.

Starfire is an experimental framework built on new and experimental APIs, including TS decorators, reflect-metadata, and Starbeam.js. Using this for anything other than experimenting is not advisable.

## Goals

- JSX without React for lightweight, reactive SFCs
- Starbeam integration from the bottom-up for universal reactivity
- Support async rendering out-of-the-box

## Quick Tutorial

### Writing components

All starfire components are classes that have an `id` and a `render` method. No need to extend a base class. You can add `implements IComponent` using our `IComponent` interface for TS benefits. 

You use Starbeam reactives to interact with state. We provide a `@track` decorator to mark which reactives should be monitored for changes and used for triggering rerenders.

Here's a basic counter component:
```tsx
import { track, render } from '@starfire'
import { Cell } from '@starbeam/universal'

class MyComponent {
    // informs starfire of what component to render/update
    id = 'my-component-id'

    // tell starfire to rerender on changes to this Cell (only works with starbeam reactives)
    @track count = Cell(0)

    increment() {
        this.count.update(prev => prev + 1)
    }

    render() {
        return (
            <div id={this.id}>
                <p>You've clicked {this.count.current} times!</p>
                <button onClick={() => this.increment()}>Click Me</button>
            </div>
        )
    }
}

render(<MyComponent/>)
```

Unlike in React, render functions do not have to be pure, so you can use async/await as you like!

```tsx
import { render } from '@starfire'

class MyAsyncComponent {
    id = 'my-async-component-id'

    later(delay: number, value: any) {
        return new Promise(function(resolve) {
            setTimeout(resolve, delay, value)
        })
    }

    async render() {
        const delayedText = await this.later(3000, "I don't render immediately")
        return (
            <p id={this.id}>{delayedText}</p>
        )
    }
}

render(<MyAsyncComponent/>)
```

Then, if you want to display an alternative while waiting for your async render, you can provide a fallback component like so:

```tsx
import { fallback, render } from '@starfire'

class MyFallbackComponent {
    constructor(props: {id: string}) {
        this.id = props.id
    }
    render() {
        <p id={this.id}>Loading...</p>
    }
}


class MyAsyncComponent {
    id: string = 'my-async-component-with-fallback'

    // loadingText will display until this.render resolves
    @fallback loadingText = <MyFallbackComponent id={this.id} />

    later(delay: number, value: any) {
        return new Promise(function(resolve) {
            setTimeout(resolve, delay, value)
        })
    }

    async render() {
        const delayedText = await this.later(3000, "I don't render immediately")
        return (
            <p id={this.id}>{delayedText}</p>
        )
    }
}

render(<MyAsyncComponent/>)
```

Reactivity optimizations in React generally use lifecycle hooks like `shouldComponentUpdate` that are specific to the component API. To implement similar behavior in Starfire, you'd use Formulas or implement equivalency logic for Cells.

For example, take our counter component from earlier and assume you only want it to rerender for the first 10 update calls:

```tsx
import { track, render } from '@starfire'
import { Cell } from '@starbeam/universal'

class MyComponent {
    id: string = 'my-component-id'

    // cell configured to only update 10 times at most
    initial = 0
    @track count = Cell(this.initial, {
        equals: (_, b) =>  b + this.initial === 10 ? true : false
    })

    increment() {
        this.count.update(prev => prev + 1)
    }

    render() {
        return (
            <div id={this.id}>
                <p>You've clicked {this.count.current} times!</p>
                <button onClick={() => this.increment()}>Click Me</button>
            </div>
        )
    }
}

render(<MyComponent/>)
```

If you wanted to re-use that reactive logic, you just extract it to a function:
```ts
function maxRenderCell(initial: number, max: number) {
    return Cell(initial, {
        equals: (_, b) =>  b + initial === max ? true : false
    })
}
```

And put it into your component:
```ts
@track count = maxRenderCell(0, 10)
```

Obviously, this is a contrived example, but reactives can hold more complex data like maps, tuples, etc and the comparisons can become more useful depending on what rendering you're trying to control. 

Moreover, the principle of separating the data layer logic of equivalency from the component API is the important thing: you can write reactive logic that's re-usable across applications, components, and services in a framework-abstract way.

That all comes from Starbeam. Starfire just provides a framework that hooks into the Starbeam API to trigger updates to your UI whenever you change your reactive data.

## Known issues and limitations

### IDs

The root of your app should have the `id` attribute set to `'app'`. Plan is to make this configurable.

All `id` properties of your component classes has to refer to the root element of the template you're rendering. If the ID is duplicated, the renderer will replace the first node it finds with the matching ID, which is pretty much never what you want.

Fallback components must have the same ID as their host component. If you provide a different ID, both the fallback and the async rendered component will be displayed simultaneously (once the render resolves).

### Async Components
Async rendering sibling nodes can create race conditions which can lead to unexpected DOM hierarchies. This also applies to arrays of children where any child has an async render method.

For example:

```tsx
import { render } from '@starfire'

class FastAsyncThing {
    id: string = "some-async-thing"
    async render() {
        const data = await SomeFastAsyncOp()
        return (
            <p id={this.id}>{data}</p>
        )
    }
}

class SlowAsyncThing {
    id: string = "another-async-thing"
    async render() {
        const data = await SomeSlowAsyncOp()
        return (
            <p id={this.id}>{data}</p>
        )
    }
}

class SomeParentComponent {
    id: string = "parent-component"
    render() {
        return (
            <div id={this.id}>
                <SlowAsyncThing/>
                <FastAsyncThing/> {/* Renders ABOVE SlowAsyncThing */}
            </div>
        )
    }
}

render(<SomeParentComponent/>)
```

To workaround this, you can:
- Use sync components as often as possible
- Move async components further down the hierarchy (e.g. make <FastAsyncThing> a child of <SlowAsyncThing>)
- Pass results of async ops from the parent to the child as props instead of state, converting children to sync

This isn't ideal, but I figure it's better to have the option to use it than not.


### Formulas

When using `@track` with a starbeam `Formula`, changes don't cause rerenders on the first change. This is a bug that needs addressing.

