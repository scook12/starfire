// What does a service need to have?
// following ember, "trackables" are `reactive`s provided by starbeam.js
// "actions" are anything that mutate a `reactive`
// upon mutating a `reactive`, `jsx.render` needs to be called against a component
// so components need some knowledge of services or vice versa

// to achieve this, services could use `@starbeam/universal`'s `Resource` which has an `on.cleanup` hook
// there's formulas, which are functions that cache the result of its computation until its dependencies change --- these could be component core? Like all components are formulas?
// The TIMELINE api lets us attach a notifier to the timeline to be called when the timeline changes and a (debug?) filter that determines which events trigger it -- we could use this? to trigger rerenders?
// the TIMELINE api also has the `on.change` hook which takes an input (reactive) and a ready callback for when the value changes. We could pass that value to the equivalent `shouldComponentUpdate`? Then rerender? Although, if components are formulas, they'd already be hooked into this?

// sample service not functioning

class SomeService extends Service {
  @track data = Cell();

  get(query) {
    // 
    return this.data.filter(query)
  }

  update(id, value) {
    // should trigger TIMELINE.on.change
    return this.table.update(prev => {
      prev.update(id, value)
    })
  }

  delete(id, callbackFn = null) {
    this.table.set(id, null)
    if (callbackFn) {}
  }
}