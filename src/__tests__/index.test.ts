import { Context, FunctionNode, SequentialGroup, Workflow } from '~/index.js'

describe('workflow', () => {
  it('should execute without errors', () => {
    async function customFunction(context: Context): Promise<void> {
      console.log('Executing custom function', context)
    }

    const funcNode = new FunctionNode('1', 'customFunction', customFunction)
    const seqGroup = new SequentialGroup('2', 'sequential group 1', [funcNode])
    const workflow = new Workflow(seqGroup)

    const initialContext: Context = { data: 'initial data' }

    workflow.run(initialContext)
  })

  it('should be able to serialize', () => {
    async function customFunction(context: Context): Promise<void> {
      console.log('Executing custom function', context)
    }

    const funcNode = new FunctionNode('1', 'customFunction', customFunction)
    const seqGroup = new SequentialGroup('2', 'sequential group 1', [funcNode])
    const workflow = new Workflow(seqGroup)

    const serialized = workflow.dump()
    expect(serialized).toBeDefined()
  })

  it('should be able to deserialize', () => {
    async function customFunction(context: Context): Promise<void> {
      console.log('Executing custom function', context)
    }

    const funcNode = new FunctionNode('1', 'customFunction', customFunction)
    const seqGroup = new SequentialGroup('2', 'sequential group 1', [funcNode])
    const workflow = new Workflow(seqGroup)

    const serialized = workflow.dump()
    const deserialized = Workflow.load(serialized)
    deserialized.run({})
  })

  it('can mutate the context', async () => {
    async function customFunction(context: Context): Promise<void> {
      context.value = 42
    }
    const funcNode = new FunctionNode('1', 'customFunction', customFunction)
    const seqGroup = new SequentialGroup('2', 'sequential group 1', [funcNode])

    const workflow = new Workflow(seqGroup)

    const context = { value: 420 }

    await workflow.run(context)

    expect(context.value).toEqual(42)
  })

  it('can read the context', async () => {
    async function hypotenuse(context: Context): Promise<void> {
      context.c_squared = context.a ** 2 + context.b ** 2
    }
    const funcNode = new FunctionNode('1', 'hypotenuse', hypotenuse)
    const seqGroup = new SequentialGroup('2', 'sequential group 1', [funcNode])

    const context: Context = { a: 5, b: 3 }
    const workflow = new Workflow(seqGroup)
    await workflow.run(context)

    expect(context.c_squared).toEqual(34)
  })

  it('can represent empty workflow', () => {
    const workflow = Workflow.empty()
    const serialized = workflow.dump()
    expect(serialized).toEqual(
      `{"id":"root","name":"sequential_root","type":"SequentialGroup","children":[]}`,
    )
  })
})
