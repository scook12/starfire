import render from '../src/jsx'
import { Cell } from '@starbeam/universal'
import { track } from '../src/metadata'
import { observeDomNodeInsertion } from '../src/dom/observer'

const testComponentId: string = "someString"
const testComponentText: string = "Test Component"
const testComponentElement: JSX.Element = <p id={testComponentId}>{testComponentText}</p>

class TestComponent {
  id: string = testComponentId
  render(): JSX.Element {
      return testComponentElement
  }
}

describe('Unit | jsx', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"><div>`
  })

  const validateRenderedNode = async (componentText: string = testComponentText) => {
    await observeDomNodeInsertion(testComponentId)
    const renderedNode = document.getElementById(testComponentId)
    expect(renderedNode).not.toBe(null)
    expect(typeof renderedNode).not.toBe("undefined")
    expect(renderedNode?.textContent).toBe(componentText)
  }

  test('renders plain component', async () => {
    render(<TestComponent/>)
    await validateRenderedNode()
  })

  test('renders async component', async () => {
    class AsyncTestComponent {
      id = testComponentId
      later(delay: number, value: string): Promise<string> {
        return new Promise(function(resolve) {
            setTimeout(resolve, delay, value)
        })
      }
      async render() {
        const delayedText: string = await this.later(2000, testComponentText)
        return <p id={testComponentId}>{delayedText}</p>
      }
    }

    render(<AsyncTestComponent/>)
    await validateRenderedNode()
  })

  test('renders tracked component', async () => {
    const renderSpy = jest.fn()

    class TrackedTestComponent {
      id = testComponentId
      @track data = Cell(0)
      increment = () => this.data.update(prev => prev + 1)
      render() {
        renderSpy()
        return (
          <div id={this.id}>
            <p id="data-test-count">{this.data.current}</p>
            <button id="data-test-increment" onClick={this.increment}>Increment</button>
          </div>
        )
      }
    }

    const ComponentUnderTest = new TrackedTestComponent()
    render(ComponentUnderTest)

    await observeDomNodeInsertion(testComponentId)
    const renderedNode = document.getElementById(testComponentId)
    expect(renderedNode).not.toBe(null)
    expect(typeof renderedNode).not.toBe("undefined")
    expect(renderSpy).toBeCalledTimes(1)

    const textNode = document.getElementById("data-test-count")
    expect(textNode?.textContent).toBe("0")

    const incrementButton = document.getElementById("data-test-increment")
    expect(incrementButton?.textContent).toBe("Increment")
  })
})