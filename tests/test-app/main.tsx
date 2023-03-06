import "reflect-metadata"
import { IComponent } from '../../src/component'
import { track } from '../../src/metadata'
import render from '../../src/jsx'
import { Cell } from '@starbeam/universal';
import { BaseProps } from "../../src/dom/types";

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

class Cellulite implements IComponent {
  constructor(props) {
    this.id = props.id
  }
  @track data = Cell(0)
  

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
  constructor(props: BaseProps) {
    this.props = props
  }
  id: string = 'sone-id'
  render() {
    return (
      <div id={this.id}>
        <Cellulite id="inlinechild" />
        {this.props.children}
      </div>
    )
  }
}

render(<HOCStateful children={[<Cellulite id="cell-deco-2"/>]}/>)