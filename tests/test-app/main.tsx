import "reflect-metadata"
import { IComponent } from '../../src/component'
import { track, fallback } from '../../src/metadata'
import render from '../../src/jsx'
import { Cell, Formula } from '@starbeam/universal';

export default class TestComponent implements IComponent {
  id = "test-component"
  @track data = Cell(0)

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

render(<TestComponent/>)



export class MultipleDependencies implements IComponent {
  id = "test-multi-component"
  @track data = Cell(0)
  @track otherData = Cell(0)
  calc = Cell(0)

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

render(<MultipleDependencies/>)


interface CelluliteProps extends JSX.ElementAttributesProperty {
  props: {
    id: string;
  }
}

class Cellulite implements IComponent {
  id: string;
  props!: CelluliteProps["props"]
  @track data = Cell(0)


  constructor(props: CelluliteProps["props"]) {
    this.props = props
    this.id = props.id
  }
  

  render() {
    return (
      <div id={this.id}>
        <button type="button" onClick={() => this.data.update(prev => prev+1)}>Click me</button>
        <p>the current value is {this.data.current}</p>
      </div>
    )
  }
}

render(<Cellulite id="cell-deco-test"/>)


class HOCStateful implements IComponent {
  id: string = 'sone-id'
  children?: JSX.ElementChildrenAttribute | undefined;

  constructor(props: {children: any}) {
    this.children = props.children
  }
  render() {
    return (
      <div id={this.id}>
        <Cellulite id="inlinechild" />
        {this.children}
      </div>
    )
  }
}

render(<HOCStateful children={[<Cellulite id="cell-deco-2"/>]}/>)

// class FormulaComponent {
//   id = "resource-test"
//   firstNum = Cell(0)
//   secondNum = Cell(0)

//   // Formulas used to express multiple dependencies
//   // BUG: first change doesn't trigger rerender?
//   @track add = Formula(() => this.firstNum.current + this.secondNum.current)

//   render() {
//     return (
//       <div id={this.id}>
//         <button onClick={() => this.firstNum.update(prev => prev + 1)}>Click to increase Number One</button>
//         <button onClick={() => this.secondNum.update(prev => prev + 1)}>Click to increase Number Two</button>
//         <p>{`${this.firstNum.current} + ${this.secondNum.current} = ${this.add()}`}</p>
//       </div>
//     )
//   }
// }

// render(<FormulaComponent/>)


class LoadingIndicator {
  id: string;
  props: any

  constructor(props: {id: string}) {
    this.id = props.id
  }
  
  render() {
    return  <p id={this.id}>Loading...</p>
  }
}


class AyncComponent {
  id = "async-test"

  @fallback loadingIndicator = <LoadingIndicator id={this.id}/>

  later(delay: number, value: any) {
    return new Promise(function(resolve) {
      setTimeout(resolve, delay, value)
    })
  }

  async render() {
    const delayed = await this.later(3000, "Delayed Text")
    return (
      <div id={this.id}>
        <p>{delayed}</p>
      </div>
    )
  }
}

render(<AyncComponent/>)



class StatefulAyncComponent {
  id = "async-state-test"
  @track data = Cell(0)

  @fallback loadingIndicator = <LoadingIndicator id={this.id}/>

  later(delay: number, value: any) {
    return new Promise(function(resolve) {
      setTimeout(resolve, delay, value)
    })
  }

  async render() {
    const delayed = await this.later(1000, "Delayed Text")
    return (
      <div id={this.id}>
        <p>{delayed}</p>
        <button onClick={() => this.data.update(prev => prev + 1)}>Rerender Me</button>
      </div>
    )
  }
}

render(<StatefulAyncComponent/>)