// Define la interfaz para el contexto
export interface Context {
  [key: string]: any
}

const NodeTokens = {
  FunctionNode: 'FunctionNode',
  SequentialGroup: 'SequentialGroup',
  ParallelGroup: 'ParallelGroup',
}

// Clase base para todos los nodos
abstract class BaseNode {
  abstract execute(context: Context): Promise<void>

  abstract dump(): any

  static load(data: any): BaseNode {
    switch (data.type) {
      case NodeTokens.FunctionNode:
        return FunctionNode.load(data)
      case NodeTokens.SequentialGroup:
        return SequentialGroup.load(data)
      case NodeTokens.ParallelGroup:
        return ParallelGroup.load(data)
      default:
        throw new Error('Unknown node type')
    }
  }
}

// Nodo que ejecuta un código personalizado
export class FunctionNode extends BaseNode {
  constructor(private func: (context: Context) => Promise<void>) {
    super()
  }

  async execute(context: Context): Promise<void> {
    await this.func(context)
  }

  dump(): any {
    return {
      type: NodeTokens.FunctionNode,
      func: this.func.toString(),
    }
  }

  static load(data: any): FunctionNode {
    const func = new Function('context', `return (${data.func})(context)`) as (
      context: Context,
    ) => Promise<void>
    return new FunctionNode(func)
  }
}

// Nodo que ejecuta nodos hijos en secuencia
export class SequentialGroup extends BaseNode {
  constructor(private children: BaseNode[]) {
    super()
  }

  async execute(context: Context): Promise<void> {
    for (const child of this.children) {
      await child.execute(context)
    }
  }

  dump(): any {
    return {
      type: NodeTokens.SequentialGroup,
      children: this.children.map((child) => child.dump()),
    }
  }

  static load(data: any): SequentialGroup {
    const children = data.children.map((child: any) => {
      return BaseNode.load(child)
    })
    return new SequentialGroup(children)
  }
}

export class ParallelGroup extends BaseNode {
  constructor(private children: BaseNode[]) {
    super()
  }

  async execute(context: Context): Promise<void> {
    await Promise.all(this.children.map((child) => child.execute(context)))
  }

  dump(): any {
    return {
      type: NodeTokens.ParallelGroup,
      children: this.children.map((child) => child.dump()),
    }
  }

  static load(data: any): ParallelGroup {
    const children = data.children.map((child: any) => {
      return BaseNode.load(child)
    })
    return new ParallelGroup(children)
  }
}

// Gestiona la secuencia de nodos
export class Workflow {
  constructor(private root: BaseNode) {}

  async run(context: Context): Promise<void> {
    await this.root.execute(context)
  }

  dump(): string {
    return JSON.stringify(this.root.dump())
  }

  static load(dataString: string): Workflow {
    const data = JSON.parse(dataString)
    return new Workflow(BaseNode.load(data))
  }
}
