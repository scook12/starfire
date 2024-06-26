import { IntrinsicElementsHTML, IntrinsicElementsSVG } from "./dom/types";

export * from "./dom/createElement";
export * from "./dom/jsx-runtime";
export * from "./dom/types";

export interface TsxConfig {
    [s: string]: boolean;
}

// Returns TIF if T is specified as true in TsxConfig, otherwise TELSE
type IfTsxConfig<T extends string, TIF, TELSE> = TsxConfig[T] extends false ? TELSE : TIF;

type IntrinsicElementsCombined = IfTsxConfig<"html", IntrinsicElementsHTML, unknown> &
    IfTsxConfig<"svg", IntrinsicElementsSVG, unknown>;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace JSX {
        // Return type of jsx syntax
        type Element = IfTsxConfig<"html", HTMLElement, never> | IfTsxConfig<"svg", SVGElement, never>;

        // The property name to use
        interface ElementAttributesProperty {
            props: unknown;
        }

        // The children name to use
        interface ElementChildrenAttribute {
            children: unknown;
        }

        // The available string tags
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface IntrinsicElements extends IntrinsicElementsCombined {}
    }
}
