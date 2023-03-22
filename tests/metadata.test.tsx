import 'reflect-metadata'
import { jest } from '@jest/globals'
import { handleTracking, StarfireMetadata, track, fallback, getFallback } from "starfire/metadata";
import { IComponent } from "starfire/component";
import { Cell, TIMELINE } from '@starbeam/universal';

class TestComponent implements IComponent {
  id: string = "someString"
  render(): JSX.Element {
      return <p>Test Component</p>
  }
}

 
describe('Unit | metadata', () => {

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('plain component is not modified', () => {

    const ComponentUnderTest = <TestComponent/>
    const timelineSpy = jest.spyOn(TIMELINE.on, 'change')

    expect(Reflect.hasMetadata(StarfireMetadata.tracked, ComponentUnderTest)).toBe(false)
    expect(Reflect.hasMetadata(StarfireMetadata.fallback, ComponentUnderTest)).toBe(false)
    handleTracking(ComponentUnderTest, () => {})
    expect(timelineSpy).toBeCalledTimes(0)
  });

  test('tracked component adds renderFunc to timeline', () => {
    class TrackedTestComponent extends TestComponent {
      @track data = Cell(0);
    }

    const ComponentUnderTest = new TrackedTestComponent()
    const timelineSpy = jest.spyOn(TIMELINE.on, 'change')

    const mockRenderFn = jest.fn()

    // validate tracking setup stores correct metadata
    expect(Reflect.hasMetadata(StarfireMetadata.tracked, ComponentUnderTest)).toBe(true)
    expect(Reflect.getMetadata(StarfireMetadata.tracked, ComponentUnderTest)).toEqual(["data"])
    expect(Reflect.hasMetadata(StarfireMetadata.fallback, ComponentUnderTest)).toBe(false)

    // tracking setup modifies timeline
    handleTracking(ComponentUnderTest, mockRenderFn)
    expect(timelineSpy).toBeCalledTimes(1)

    // renderFunc called on timeline change
    ComponentUnderTest.data.set(1)
    expect(mockRenderFn).toBeCalledTimes(1)

    // no change to tracked attr doesn't call render
    ComponentUnderTest.data.set(1)
    expect(mockRenderFn).toBeCalledTimes(1)

    // calls render on update
    ComponentUnderTest.data.update(prev => prev + 1)
    expect(mockRenderFn).toBeCalledTimes(2)
  });

  test('fallback component is retrievable', async () => {
    const fallbackRenderSpy = jest.fn()
    class FallbackTestComponent extends TestComponent {
      render() {
        fallbackRenderSpy()
        return (
          <p>Fallback component</p>
        )
      }
    }

    // plain component has no fallback
    const fallbackComponent = <FallbackTestComponent/>
    expect(getFallback(fallbackComponent)).toBe(null)

    class ComponentWithFallback extends TestComponent {
      @fallback loader = <FallbackTestComponent/>
    }

    // decorated component has fallback component
    const ComponentUnderTest = <ComponentWithFallback/>
    const storedFallback = getFallback(ComponentUnderTest)
    expect(storedFallback).not.toBe(null)
  });
});