import { TemporalGraph } from './temporalGraph'

// Define o tipo de função de cálculo. Recebe valores dos filhos e retorna um número.
type ComputeFn = (...dependencies: number[]) => number

// O que vamos guardar dentro de cada nó do seu grafo
interface LazyNodeData {
  name: string
  type: 'SOURCE' | 'COMPUTED' // SOURCE = Valor fixo (input), COMPUTED = Fórmula

  // Se for SOURCE
  value?: number

  // Se for COMPUTED
  compute?: ComputeFn

  // O "Colapso": Cache para memoization.
  // Como seu grafo é temporal, o cache precisa ser atrelado ao tempo (snapshot).
  // Map<timestamp, valor_calculado>
  cache: Map<number, number>
}

export class LazyGraphEngine {
  // Instancia o seu grafo tipado com a nossa estrutura de dados
  public graph: TemporalGraph<LazyNodeData, any>

  constructor() {
    // Inicializa seu grafo com uma função de identidade simples (pelo nome)
    this.graph = new TemporalGraph<LazyNodeData>(data => data.name)
  }

  // Helper para criar nós "Fonte" (Input de dados)
  createSource(name: string, initialValue: number) {
    return this.graph.insertNode({
      name,
      type: 'SOURCE',
      value: initialValue,
      cache: new Map()
    })
  }

  // Helper para criar nós "Calculados" (Fórmulas)
  createComputed(name: string, formula: ComputeFn) {
    return this.graph.insertNode({
      name,
      type: 'COMPUTED',
      compute: formula,
      cache: new Map()
    })
  }

  // Helper para criar dependência temporal (Aresta)
  addDependency(fromNode: string, toNode: string, startAt: number, endAt?: number) {
    // IMPORTANTE: A direção da aresta define o fluxo de dados ou de dependência?
    // Padrão Lazy: "A depende de B" significa A -> B.
    // A vai "sugar" o dado de B.
    this.graph.addTemporalEdge(fromNode, toNode, startAt, undefined, endAt)
  }

  /**
   * O MÉTODO MÁGICO: getValueAt(nodeId, time)
   * 1. Verifica Cache (Memoization)
   * 2. Descobre dependências ATIVAS naquele tempo (usando sua lib)
   * 3. Recursão (Lazy Eval)
   * 4. Cálculo e Colapso
   */
  getValueAt(nodeId: string, time: number): number {
    const nodeWrapper = this.graph.getNode(nodeId)
    if (!nodeWrapper) throw new Error(`Nó ${nodeId} não encontrado`)

    const nodeData = nodeWrapper.data

    // 1. Se for nó fonte, retorna o valor base (não há o que calcular recursivamente)
    if (nodeData.type === 'SOURCE') {
      return nodeData.value ?? 0
    }

    // 2. Verificação de Cache (Colapso)
    // Se já calculamos esse nó PARA ESSE TIMESTAMP exato, retornamos.
    if (nodeData.cache.has(time)) {
      console.log(`[CACHE] ${nodeId} (t=${time}) retornou ${nodeData.cache.get(time)}`)
      return nodeData.cache.get(time)!
    }

    console.log(`[CALC] Calculando ${nodeId} em t=${time}...`)

    // 3. Busca dependências ATIVAS no tempo
    // Sua lib brilha aqui: pegamos apenas arestas que existem em 'time'
    const edges = this.graph.getOutgoingEdges(nodeId)

    // Filtramos manualmente pelo tempo pois getOutgoingEdges retorna tudo (na sua lib original),
    // ou usamos getActiveEdgesAt se quisermos varrer tudo (menos eficiente).
    // O ideal é filtrar as arestas saindo do nó atual pelo tempo:
    const activeDependencies = edges.filter(e => {
      const start = e.activated_at
      const end = e.deactivated_at ?? Infinity
      return start <= time && time <= end
    })

    // 4. Recursão (Backward Propagation)
    // "Puxa" o valor de cada dependência nesse instante de tempo
    const childrenValues = activeDependencies.map(edge => {
      return this.getValueAt(edge.to, time)
    })

    // 5. Aplica a fórmula
    let result = 0
    if (nodeData.compute) {
      // Se não tiver dependências ativas, passamos array vazio. A fórmula deve lidar.
      result = nodeData.compute(...childrenValues)
    }

    // 6. Colapso e Armazenamento
    nodeData.cache.set(time, result)

    return result
  }

  // Limpa o cache se algo mudar (invalidação)
  invalidateCache(nodeId: string) {
    const node = this.graph.getNode(nodeId)
    if (node) node.data.cache.clear()
  }
}
