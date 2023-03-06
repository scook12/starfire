import "reflect-metadata"
import { IComponent } from '../../src/component'
import { Cell, LIFETIME, TIMELINE } from '@starbeam/universal';
import render from '../../src/jsx'
import { BaseProps } from 'tsx-dom';

export default class TestComponent implements IComponent {
  id = "test-component"
  data = Cell(0)
  dependencies = [this.data]

  getNewData() {
    this.data.update(prev => prev + 1)
  }

  render(): JSX.Element {
    return (
      <div id={this.id}>
        <button type="button" onClick={() => this.getNewData()}>Click me</button>
        <p>{this.data.current}</p>
      </div>
    )
  }
}
// this works!!
render(TestComponent)


let id = "test-function-comp"
let data = Cell('RUM')

const FuncComp = () => {
  return (
    <div id={id}>
      <button type='button' onClick={() => data.set('GIN')}>Change Liquor</button>
      <p>HO HO HO AND A BOTTLE OF {data.current}</p>
    </div>
  )
}
// this works!!
TIMELINE.on.change(data, () => render(FuncComp, id))
render(FuncComp, id)


class HOCTest implements IComponent {
   constructor(props: BaseProps) {
      this.props = props
    }
  
  id = "test-parent"
  dependencies = []
  render(): JSX.Element {
    return (
      <div id={this.id}>
        {this.props.children}
        <FuncComp/>
      </div>
    )
  }
}
id = "test-function-comp-2"
TIMELINE.on.change(data, () => render(FuncComp, id))
// renders children, doesn't work for classes yet
// second `on.change` call for the same data overwrites the first
// meaning that two components can't subscribe to the same reactive
// this is because the starbeam/universal `TIMELINE` export is a constant
// we also don't want to support this, encourages global mutable reactives
// subscribed to by the UI which is the grossest thing I've ever heard, actually
render(HOCTest)

interface HOCFuncTestProps extends BaseProps {

}

const BasicChild = ({word}: any) => <p>Some {word}!</p>

const HOCFuncTest = ({children}: HOCFuncTestProps) => {
  return (
    <div id="someId">
      {children}
      <BasicChild word={"ho ho ho"} />
    </div>
  )
}

// this works! can pass child(ren) that receive props to basic functional HOC
render(HOCFuncTest, "someId", {children: [<BasicChild word={'texto'}/>, <BasicChild word={'wordies'}/>, ]})



export class MultipleDependencies implements IComponent {
  id = "test-multi-component"
  data = Cell(0)
  otherData = Cell(0)
  calc = Cell(0)
  dependencies = [this.data, this.otherData]

  getNewData() {
    this.data.update(prev => prev + 1)
  }

  getOtherData() {
    this.otherData.update(prev => prev + 3)
  }

  changeNothing(){
    this.calc.update(prev => prev + 7)
  }

  render(): JSX.Element {
    return (
      <div id={this.id}>
        <br></br><br></br>
        <button type="button" onClick={() => this.getNewData()}>Click me</button>
        <button type="button" onClick={() => this.getOtherData()}>Click me, too</button>
        <button type="button" onClick={() => this.changeNothing()}>Click me, i guess</button>
        <p>{this.data.current} + {this.otherData.current} = {this.data.current + this.otherData.current}</p>
        <p>{this.calc.current}</p>
      </div>
    )
  }
}
// this works! if any dependency changes, the component rerenders without stale references. 
// Notably, the exclusion of a reactive `calc` from the dependencies list also works as expected
// --- when that data changes, nothing rerenders! but on rerenders of the _rest_ of the component, the data
// is updated to reflect how many times it's been clicked! This is useful for tracking internal state that should change in the background
// but shouldn't trigger a render on its own. Imagine a tracker that counts the number of times you've clicked on a page, and you want to display
// that info to a user --- you could re-render on every click to show the number, or you could put a "check clicks" button that only rerenders
// when the user wants that info which is much more performant on the client side of things. Moreover, it gives you the option
// to pass a reference to a cell to another component, mutate it, and pass it back without triggering rerenders of the mutating
// component which could be useful in state that's shared between components.
render(MultipleDependencies)


function log(target: Object, propertyKey: string | symbol): void {
  console.log('called a decorator bro')
  return function(target: Object, propertyKey: string) {
    console.log('called a decorator bro')
    let value: string;
    const getter = () => value + "worked"
    const setter = (newVal: string) => {
      value = newVal
    }
    Object.defineProperty(target, propertyKey, {get: getter, set: setter})
  }
}

class User {
  @log username: string;

   constructor(username: string) {
      this.username = username
    }
}

const user = new User("Sammy")
console.log(user.username)

type ReactiveProperty = (target: Object, propertyKey: string, initialValue: any) => void

type ObjectKey = keyof typeof Object;

function track(target: Object, propertyKey: string | symbol): any {
  // reflect has a metadata api --- maybe we can use this for introspecting type data?
  // then makes it easier to see lifetime, timeline management
  // could also use it to make functional component state work?
  Reflect.defineProperty
  Object.defineProperty(target, 'dependencies', {value: [`this.${propertyKey.toString()}`]})

}

interface DataProps {
  data: number;
}

class Cellulite implements IComponent {
  id: string = 'cell-deco-test'
  dependencies = []

  @track data = Cell(0)
  

  render() {
    console.log(this.data)
    return (
      <div id={this.id}>
        <button type="button" onClick={() => this.data.update(prev => prev+1)}>Click me</button>
        <p>the current value is {this.data.current}</p>
      </div>
    )
  }
}

render(Cellulite)