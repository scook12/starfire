import { BaseProps } from './dom/types';

export interface IComponent {
  id: string;
  props?: BaseProps
  render(): JSX.Element;
}
