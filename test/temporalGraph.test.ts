import { TemporalGraph } from '../src/temporalGraph'

describe('TemporalGraph', () => {
  let graph: TemporalGraph<string, any>

  beforeEach(() => {
    graph = new TemporalGraph<string, any>((data) => data)
  })

  // NOTE: Estes testes são para uma versão antiga da API que tinha métodos
  // como earliestArrivalPath, fastestPath, temporalBetweennessCentrality, etc.
  // Esses métodos não existem na implementação atual.
  // Os testes atuais do TemporalGraph estão nos arquivos de teste de métricas.

  test('should add nodes and temporal edges', () => {
    graph.insertNode('A')
    graph.insertNode('B')
    graph.addTemporalEdge('A', 'B', 1, undefined, 5)

    const edges = graph.getAllEdges()
    expect(edges.length).toBeGreaterThan(0)
    const edge = edges.find(e => e.from === 'A' && e.to === 'B')
    expect(edge).toBeDefined()
    if (edge) {
      expect(edge.activated_at).toBe(1)
      expect(edge.deactivated_at).toBe(5)
    }
  })

  test('should get active edges at a specific time', () => {
    graph.insertNode('A')
    graph.insertNode('B')
    graph.insertNode('C')

    graph.addTemporalEdge('A', 'B', 1, undefined, 5)
    graph.addTemporalEdge('B', 'C', 6, undefined, 10)

    const activeAt3 = graph.getActiveEdgesAt(3)
    expect(activeAt3.length).toBe(1) // Only A->B should be active

    const activeAt7 = graph.getActiveEdgesAt(7)
    expect(activeAt7.length).toBe(1) // Only B->C should be active
  })

  test('should calculate temporal shortest path', () => {
    graph.insertNode('A')
    graph.insertNode('B')
    graph.insertNode('C')

    graph.addTemporalEdge('A', 'B', 1, undefined, 5)
    graph.addTemporalEdge('B', 'C', 6, undefined, 10)

    const path = graph.temporalShortestPath('A', 'C')
    expect(path).toEqual(['A', 'B', 'C'])
  })
})
