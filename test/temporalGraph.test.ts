import TemporalGraph from '../src/temporalGraph'

describe('TemporalGraph', () => {
  let graph: TemporalGraph<any>

  beforeEach(() => {
    graph = new TemporalGraph(n => n.id)
  })

  test('should add nodes and temporal edges', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.addTemporalEdge('A', 'B', 1, 5)

    const edges = graph.getTemporalEdges('A', 'B')
    expect(edges).toHaveLength(1)
    expect(edges[0]).toEqual({ start: 1, end: 5 })
  })

  test('should calculate earliest arrival path', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.insert({ id: 'C' })

    // A -> B (start: 1, end: 5)
    graph.addTemporalEdge('A', 'B', 1, 5)
    // B -> C (start: 6, end: 10)
    graph.addTemporalEdge('B', 'C', 6, 10)
    // B -> C (start: 4, end: 8) - cannot be taken if arriving at B at 5
    graph.addTemporalEdge('B', 'C', 4, 8)

    // Start at A at time 0
    const arrival = graph.earliestArrivalPath('A', 'C', 0)
    expect(arrival).toBe(10)
  })

  test('should return Infinity if not reachable', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.insert({ id: 'C' })

    // A -> B (start: 10, end: 15)
    graph.addTemporalEdge('A', 'B', 10, 15)
    // B -> C (start: 5, end: 8) - departs before arrival at B
    graph.addTemporalEdge('B', 'C', 5, 8)

    const arrival = graph.earliestArrivalPath('A', 'C', 0)
    expect(arrival).toBe(Infinity)
  })

  test('should calculate fastest path', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.insert({ id: 'C' })

    // Path 1: A -> B -> C (Duration: (5-1) + (10-6) = 4 + 4 = 8? No, duration is Arrival - Start)
    // Wait, fastest path definition: Arrival Time - Departure Time from Source.

    // Path 1:
    // A -> B (1, 5)
    // B -> C (6, 10)
    // Arrival at C: 10. Start at A: 1. Duration: 9.

    // Path 2:
    // A -> B (10, 12)
    // B -> C (12, 14)
    // Arrival at C: 14. Start at A: 10. Duration: 4.

    graph.addTemporalEdge('A', 'B', 1, 5)
    graph.addTemporalEdge('B', 'C', 6, 10)

    graph.addTemporalEdge('A', 'B', 10, 12)
    graph.addTemporalEdge('B', 'C', 12, 14)

    const duration = graph.fastestPath('A', 'C', 0)
    expect(duration).toBe(4)
  })

  test('should calculate temporal betweenness centrality', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.insert({ id: 'C' })
    graph.insert({ id: 'D' })

    // A -> B -> D
    // C -> B -> D
    // B is central to both paths

    graph.addTemporalEdge('A', 'B', 1, 2)
    graph.addTemporalEdge('B', 'D', 3, 4)

    graph.addTemporalEdge('C', 'B', 1, 2)
    // Reuse B->D edge

    const centrality = graph.temporalBetweennessCentrality(0, 10)

    // A->D passes through B
    // C->D passes through B
    // A->B direct
    // C->B direct
    // B->D direct

    expect(centrality.get('B')).toBeGreaterThan(0)
    expect(centrality.get('A')).toBe(0)
    expect(centrality.get('C')).toBe(0)
    expect(centrality.get('D')).toBe(0)
  })
})
