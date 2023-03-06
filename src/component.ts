import { Cell, Resource } from '@starbeam/universal';

type AnyReactive = Cell<any> | Resource<any> 

export interface IComponent {
  id: string;
  dependencies: AnyReactive[];
  render(): JSX.Element;
}
