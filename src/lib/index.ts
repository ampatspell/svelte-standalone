import { mount, unmount, type ComponentProps } from "svelte"
import Thingie from "./thingie.svelte"

export type ThingieProps = ComponentProps<typeof Thingie>;

export const thingie = (target: HTMLElement, props: ThingieProps) => {
  const component = mount(Thingie, {
    target,
    props,
  });
  return () => unmount(component);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).thingie = thingie;
