import { BaseProps } from './dom/types';

export interface IComponent {
  id: string;
  props?: unknown
  children?: JSX.ElementChildrenAttribute
  render(): JSX.Element;
}
