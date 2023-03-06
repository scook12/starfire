import { Cell } from '@starbeam/universal';
import Component from "../src/component";

class TestComponent extends Component {
  data = Cell(0)

  dependencies = [this.data]

  render(): JSX.Element {
    return (
      <p>this.data.current</p>
    )
  }
}