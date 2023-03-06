import { Cell } from '@starbeam/universal';
import { IComponent} from "../src/component";

class TestComponent implements IComponent {
  id = "someId"
  data = Cell(0)

  dependencies = [this.data]

  render(): JSX.Element {
    return (
      <p id={this.id}>this.data.current</p>
    )
  }
}