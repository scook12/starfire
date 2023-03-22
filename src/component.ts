export interface IComponent {
  id: string;
  props?: unknown
  children?: JSX.ElementChildrenAttribute
  render(): JSX.Element | Promise<JSX.Element>;
}
