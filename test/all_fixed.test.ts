import { DirectedGraph, DirectedAcyclicGraph } from '../src/'
import { CycleError } from '../src/errors'

/***
 * Directed Acyclic Graph test
 */

describe('Directed Acyclic Graph', () => {
  it('can be instantiated', () => {
    expect(new DirectedAcyclicGraph<{}>()).toBeInstanceOf(DirectedAcyclicGraph)
  })

  it('can be converted from a directed graph', () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')
    graph.addEdge('A', 'C')

    expect(DirectedAcyclicGraph.fromDirectedGraph(graph)).toBeInstanceOf(DirectedAcyclicGraph)

    graph.addEdge('C', 'A')

    expect(() => DirectedAcyclicGraph.fromDirectedGraph(graph)).toThrow(CycleError)
  })

  it("can add an edge only if it wouldn't create a cycle", () => {
    type NodeType = { name: string }
    const graph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')
    graph.addEdge('A', 'C')

    expect(() => graph.addEdge('C', 'A')).toThrow(CycleError)
  })

  it("can get it's nodes topologically sorted", () => {
    type NodeType = { name: string }
    const graph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)

    expect(graph.topologicallySortedNodes()).toEqual([])

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    const topoList1 = graph.topologicallySortedNodes()

    expect(topoList1).toContainEqual({ name: 'A' })
    expect(topoList1).toContainEqual({ name: 'B' })
    expect(topoList1).toContainEqual({ name: 'C' })

    graph.addEdge('A', 'C')
    graph.addEdge('C', 'B')

    const topoList2 = graph.topologicallySortedNodes()

    expect(topoList2).toEqual([{ name: 'A' }, { name: 'C' }, { name: 'B' }])

    graph.insert({ name: 'D' })
    graph.insert({ name: 'E' })

    graph.addEdge('A', 'D')
    graph.addEdge('B', 'E')

    const topoList3 = graph.topologicallySortedNodes()

    expect(topoList3[0]).toEqual({ name: 'A' })
    expect(topoList3[4]).toEqual({ name: 'E' })

    expect([{ name: 'C' }, { name: 'D' }]).toContainEqual(topoList3[1])
    expect([{ name: 'C' }, { name: 'D' }]).toContainEqual(topoList3[2])

    graph.insert({ name: 'F' })

    const topoList4 = graph.topologicallySortedNodes()

    expect(topoList4).toContainEqual({ name: 'F' })
    expect([{ name: 'A' }, { name: 'F' }]).toContainEqual(topoList4[0])
    expect([{ name: 'A' }, { name: 'F' }]).toContainEqual(topoList4[1])
  })

  it('can return a subgraph based on walking from a start node', () => {
    type NodeType = { name: string }
    const graph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    const testGraph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)
    testGraph.insert({ name: 'A' })

    expect(graph.getSubGraphStartingFrom('A').getNodes()).toEqual(testGraph.getNodes())

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')

    const subGraph = graph.getSubGraphStartingFrom('A')

    expect(subGraph.getNodes()).toContainEqual({ name: 'A' })
    expect(subGraph.getNodes()).toContainEqual({ name: 'B' })
    expect(subGraph.getNodes()).toContainEqual({ name: 'C' })
    expect(subGraph.canReachFrom('A', 'C')).toBe(true)

    graph.insert({ name: 'D' })

    const subGraph2 = graph.getSubGraphStartingFrom('A')

    expect(subGraph2.getNodes()).not.toContainEqual({ name: 'D' })

    graph.addEdge('B', 'D')

    const subGraph3 = graph.getSubGraphStartingFrom('A')

    expect(subGraph3.getNodes()).toContainEqual({ name: 'D' })
    expect(subGraph3.canReachFrom('A', 'C')).toBe(true)
    expect(subGraph3.canReachFrom('A', 'D')).toBe(true)
    expect(subGraph3.canReachFrom('B', 'D')).toBe(true)
    expect(subGraph3.canReachFrom('C', 'D')).toBe(false)
  })
})
import { DirectedGraph, Graph } from '../src/'
import { NodeDoesntExistError } from '../src/errors'

/***
 * Directed Graph test
 */

describe('Directed Graph', () => {
  it('can be instantiated', () => {
    expect(new DirectedGraph<{}>()).toBeInstanceOf(DirectedGraph)
  })

  it('can calculate the indegree of a node', () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    expect(graph.indegreeOfNode('A')).toBe(0)
    expect(graph.indegreeOfNode('B')).toBe(0)
    expect(graph.indegreeOfNode('C')).toBe(0)
    expect(() => graph.indegreeOfNode('D')).toThrowError(NodeDoesntExistError)

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')
    graph.addEdge('A', 'C')
    graph.addEdge('C', 'A')

    expect(graph.indegreeOfNode('A')).toBe(1)
    expect(graph.indegreeOfNode('B')).toBe(1)
    expect(graph.indegreeOfNode('C')).toBe(2)
  })

  it('can determine if it is acyclical', () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    expect(graph.isAcyclic()).toBe(true)

    graph.addEdge('A', 'B')

    expect(graph.isAcyclic()).toBe(true)

    graph.addEdge('A', 'C')

    expect(graph.isAcyclic()).toBe(true)

    graph.addEdge('C', 'A')
    ;(graph as any).hasCycle = undefined

    expect(graph.isAcyclic()).toBe(false)

    const graph2 = new DirectedGraph<NodeType>((n: NodeType) => n.name)
    graph2.insert({ name: 'A' })

    expect(graph2.isAcyclic()).toBe(true)

    graph2.addEdge('A', 'A')
    ;(graph2 as any).hasCycle = undefined

    expect(graph2.isAcyclic()).toBe(false)

    const graph3 = new DirectedGraph<NodeType>((n: NodeType) => n.name)
    graph3.insert({ name: 'A' })
    graph3.insert({ name: 'B' })
    graph3.insert({ name: 'C' })
    graph3.insert({ name: 'D' })
    graph3.insert({ name: 'E' })

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('A', 'B')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('B', 'C')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('C', 'D')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('C', 'E')

    expect(graph3.isAcyclic()).toBe(true)

    graph3.addEdge('E', 'B')
    ;(graph3 as any).hasCycle = undefined

    expect(graph3.isAcyclic()).toBe(false)

    graph3.addEdge('E', 'C')
    ;(graph3 as any).hasCycle = undefined

    expect(graph3.isAcyclic()).toBe(false)

    graph3.addEdge('E', 'E')
    ;(graph3 as any).hasCycle = undefined

    expect(graph3.isAcyclic()).toBe(false)
  })

  it('can determine if adding an edge would create a cycle', () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    expect(graph.wouldAddingEdgeCreateCyle('A', 'B')).toBe(false)
    expect(graph.wouldAddingEdgeCreateCyle('A', 'A')).toBe(true)

    graph.addEdge('A', 'B')

    expect(graph.wouldAddingEdgeCreateCyle('B', 'C')).toBe(false)
    expect(graph.wouldAddingEdgeCreateCyle('B', 'A')).toBe(true)

    graph.addEdge('B', 'C')

    expect(graph.wouldAddingEdgeCreateCyle('A', 'C')).toBe(false)
    expect(graph.wouldAddingEdgeCreateCyle('C', 'A')).toBe(true)
  })

  it('can determine if one node can be reached from another', () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })
    graph.insert({ name: 'D' })

    expect(graph.canReachFrom('A', 'B')).toBe(false)
    expect(graph.canReachFrom('A', 'A')).toBe(false)

    graph.addEdge('A', 'B')

    expect(graph.canReachFrom('B', 'C')).toBe(false)
    expect(graph.canReachFrom('A', 'B')).toBe(true)
    expect(graph.canReachFrom('B', 'A')).toBe(false)

    graph.addEdge('B', 'C')
    graph.addEdge('B', 'D')

    expect(graph.canReachFrom('A', 'C')).toBe(true)
    expect(graph.canReachFrom('B', 'D')).toBe(true)
    expect(graph.canReachFrom('C', 'D')).toBe(false)
  })

  it('can return a subgraph based on walking from a start node', () => {
    type NodeType = { name: string }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    graph.insert({ name: 'A' })
    graph.insert({ name: 'B' })
    graph.insert({ name: 'C' })

    const testGraph = new DirectedGraph<NodeType>((n: NodeType) => n.name)
    testGraph.insert({ name: 'A' })

    expect(graph.getSubGraphStartingFrom('A').getNodes()).toEqual(testGraph.getNodes())

    graph.addEdge('A', 'B')
    graph.addEdge('B', 'C')

    const subGraph = graph.getSubGraphStartingFrom('A')

    expect(subGraph.getNodes()).toContainEqual({ name: 'A' })
    expect(subGraph.getNodes()).toContainEqual({ name: 'B' })
    expect(subGraph.getNodes()).toContainEqual({ name: 'C' })
    expect(subGraph.canReachFrom('A', 'C')).toBe(true)

    graph.insert({ name: 'D' })

    const subGraph2 = graph.getSubGraphStartingFrom('A')

    expect(subGraph2.getNodes()).not.toContainEqual({ name: 'D' })

    graph.addEdge('B', 'D')

    const subGraph3 = graph.getSubGraphStartingFrom('A')

    expect(subGraph3.getNodes()).toContainEqual({ name: 'D' })
    expect(subGraph3.canReachFrom('A', 'C')).toBe(true)
    expect(subGraph3.canReachFrom('A', 'D')).toBe(true)
    expect(subGraph3.canReachFrom('B', 'D')).toBe(true)
    expect(subGraph3.canReachFrom('C', 'D')).toBe(false)
  })
})
import { TemporalGraph, TemporalEdge } from '../src/temporalGraph'
import {
  edgeDuration,
  averageEdgeDurationBetween,
  edgeRecurrence
} from '../src/metrics/edgeMetrics'

describe('edgeMetrics', () => {
  let graph: TemporalGraph<string, any>

  beforeEach(() => {
    graph = new TemporalGraph<string, any>((data) => data)
  })

  describe('edgeDuration', () => {
    it('should calculate duration for closed edge', () => {
      const edge: TemporalEdge = {
        id: 'test',
        from: 'A',
        to: 'B',
        created_at: 0,
        activated_at: 10,
        deactivated_at: 30
      }

      expect(edgeDuration(edge)).toBe(20)
    })

    it('should use now for open edge', () => {
      const now = 100
      const edge: TemporalEdge = {
        id: 'test',
        from: 'A',
        to: 'B',
        created_at: 0,
        activated_at: 10
        // No deactivation
      }

      expect(edgeDuration(edge, now)).toBe(90) // 100 - 10
    })

    it('should default to Date.now() when now not provided', () => {
      const edge: TemporalEdge = {
        id: 'test',
        from: 'A',
        to: 'B',
        created_at: 0,
        activated_at: Date.now() - 1000 // 1 second ago
        // No deactivation
      }

      const duration = edgeDuration(edge)
      // Should be approximately 1000ms (within 100ms tolerance)
      expect(duration).toBeGreaterThan(900)
      expect(duration).toBeLessThan(1100)
    })

    it('should handle zero duration', () => {
      const edge: TemporalEdge = {
        id: 'test',
        from: 'A',
        to: 'B',
        created_at: 0,
        activated_at: 10,
        deactivated_at: 10
      }

      expect(edgeDuration(edge)).toBe(0)
    })
  })

  describe('averageEdgeDurationBetween', () => {
    it('should return 0 when no edges exist', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      expect(averageEdgeDurationBetween(graph, 'A', 'B')).toBe(0)
    })

    it('should calculate average duration correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      const now = 100

      // Edge 1: 10ms duration (10-20)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      // Edge 2: 20ms duration (30-50)
      graph.addTemporalEdge('A', 'B', 30, undefined, 50)

      // Average: (10 + 20) / 2 = 15ms
      expect(averageEdgeDurationBetween(graph, 'A', 'B', now)).toBe(15)
    })

    it('should only consider edges between specified nodes', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      const now = 100

      graph.addTemporalEdge('A', 'B', 10, undefined, 20) // 10ms
      graph.addTemporalEdge('A', 'C', 30, undefined, 50) // 20ms (should be ignored)
      graph.addTemporalEdge('A', 'B', 60, undefined, 80) // 20ms

      // Average: (10 + 20) / 2 = 15ms (only A->B edges)
      expect(averageEdgeDurationBetween(graph, 'A', 'B', now)).toBe(15)
    })

    it('should handle open intervals', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      const now = 100

      // Edge 1: closed (10-20 = 10ms)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      // Edge 2: open (30-now = 70ms)
      const edge2 = graph.addTemporalEdge('A', 'B', 30)

      // Average: (10 + 70) / 2 = 40ms
      expect(averageEdgeDurationBetween(graph, 'A', 'B', now)).toBe(40)
    })

    it('should handle single edge', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      const now = 100

      graph.addTemporalEdge('A', 'B', 10, undefined, 30)

      // Average: 20ms / 1 = 20ms
      expect(averageEdgeDurationBetween(graph, 'A', 'B', now)).toBe(20)
    })

    it('should not consider reverse direction', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      const now = 100

      graph.addTemporalEdge('A', 'B', 10, undefined, 20) // Should be counted
      graph.addTemporalEdge('B', 'A', 30, undefined, 50) // Should be ignored

      // Average: 10ms / 1 = 10ms (only A->B)
      expect(averageEdgeDurationBetween(graph, 'A', 'B', now)).toBe(10)
    })
  })

  describe('edgeRecurrence', () => {
    it('should return 0 when no edges exist', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      expect(edgeRecurrence(graph, 'A', 'B')).toBe(0)
    })

    it('should count edges between nodes', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('A', 'B', 30, undefined, 40)
      graph.addTemporalEdge('A', 'B', 50, undefined, 60)

      expect(edgeRecurrence(graph, 'A', 'B')).toBe(3)
    })

    it('should only count edges in specified direction', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20) // Counted
      graph.addTemporalEdge('A', 'B', 30, undefined, 40) // Counted
      graph.addTemporalEdge('B', 'A', 50, undefined, 60) // Not counted

      expect(edgeRecurrence(graph, 'A', 'B')).toBe(2)
    })

    it('should handle single recurrence', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)

      expect(edgeRecurrence(graph, 'A', 'B')).toBe(1)
    })

    it('should ignore edges to other nodes', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20) // Counted
      graph.addTemporalEdge('A', 'C', 30, undefined, 40) // Ignored
      graph.addTemporalEdge('B', 'C', 50, undefined, 60) // Ignored

      expect(edgeRecurrence(graph, 'A', 'B')).toBe(1)
    })

    it('should count edges regardless of time', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // Edges at different times
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('A', 'B', 1000, undefined, 2000)
      graph.addTemporalEdge('A', 'B', 50000, undefined, 60000)

      expect(edgeRecurrence(graph, 'A', 'B')).toBe(3)
    })

    it('should handle nodes that do not exist', () => {
      graph.insertNode('A')

      // Should not throw, just return 0
      expect(edgeRecurrence(graph, 'A', 'B')).toBe(0)
      expect(edgeRecurrence(graph, 'X', 'Y')).toBe(0)
    })
  })
})

import { NodeAlreadyExistsError, NodeDoesntExistError } from '../src/errors'
import { Graph } from '../src/'
var hash = require('object-hash')

/***
 * Graph test
 */

describe('Graph', () => {
  it('can be instantiated', () => {
    expect(new Graph<{}>()).toBeInstanceOf(Graph)
  })

  it('can add a node', () => {
    const graph = new Graph<{ a: number; b: string }>()

    graph.insert({ a: 1, b: 'b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)

    expect(() => {
      graph.insert({ a: 1, b: 'b' })
    }).toThrow(NodeAlreadyExistsError)
    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
  })

  it('can add a node with custom identity function', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)

    expect(() => {
      graph.insert({ a: 1, b: 'not b' })
    }).toThrow(NodeAlreadyExistsError)
    expect(() => {
      graph.insert({ a: 1.0007, b: 'not b' })
    }).toThrow(NodeAlreadyExistsError)

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)

    graph.insert({ a: 2, b: 'not b' })

    expect((graph as any).nodes.size).toBe(2)
    expect((graph as any).adjacency.length).toBe(2)
    expect((graph as any).adjacency[0].length).toBe(2)
  })

  it('can replace a node', () => {
    const graph = new Graph<{ a: number; b: string }>()

    graph.insert({ a: 1, b: 'b' })
    graph.replace({ a: 1, b: 'b' })

    expect(() => {
      graph.replace({ a: 1, b: 'c' })
    }).toThrow(NodeDoesntExistError)
    expect((graph as any).nodes.get(hash({ a: 1, b: 'c' }))).toBeUndefined()

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get(hash({ a: 1, b: 'b' }))).toEqual({ a: 1, b: 'b' })
  })

  it('can replace a node with custom identity function', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })
    graph.replace({ a: 1, b: 'not b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get('1.00')).toBeDefined()
    expect((graph as any).nodes.get('1.00')).toEqual({ a: 1, b: 'not b' })

    graph.replace({ a: 1.0007, b: 'not b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get('1.00')).toBeDefined()
    expect((graph as any).nodes.get('1.00')).toEqual({ a: 1.0007, b: 'not b' })

    expect(() => {
      graph.replace({ a: 2.5, b: 'c' })
    }).toThrow(NodeDoesntExistError)
    expect((graph as any).nodes.get('2.50')).toBeUndefined()
  })

  it('can upsert a node', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })
    graph.upsert({ a: 1, b: 'not b' })

    expect((graph as any).nodes.size).toBe(1)
    expect((graph as any).adjacency.length).toBe(1)
    expect((graph as any).adjacency[0].length).toBe(1)
    expect((graph as any).nodes.get('1.00')).toBeDefined()
    expect((graph as any).nodes.get('1.00')).toEqual({ a: 1, b: 'not b' })

    graph.upsert({ a: 2.5, b: 'super not b' })

    expect((graph as any).nodes.size).toBe(2)
    expect((graph as any).adjacency.length).toBe(2)
    expect((graph as any).adjacency[0].length).toBe(2)
    expect((graph as any).nodes.get('2.50')).toBeDefined()
    expect((graph as any).nodes.get('2.50')).toEqual({ a: 2.5, b: 'super not b' })
  })

  it('can add an edge', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })

    expect(() => graph.addEdge('3.00', '2.00')).toThrow(NodeDoesntExistError)
    expect(() => graph.addEdge('1.00', '2.00')).toThrow(NodeDoesntExistError)
    expect(() => graph.addEdge('2.00', '1.00')).toThrow(NodeDoesntExistError)

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 3, b: 'b' })
    graph.insert({ a: 4, b: 'b' })

    graph.addEdge('1.00', '2.00')
    expect((graph as any).adjacency[0][1]).toBe(1)
    expect((graph as any).adjacency[1][0]).toBeFalsy()
    expect((graph as any).adjacency[1][2]).toBe(0)

    graph.addEdge('2.00', '1.00')
    expect((graph as any).adjacency[0][1]).toBe(1)
    expect((graph as any).adjacency[1][0]).toBe(1)
    expect((graph as any).adjacency[1][2]).toBeFalsy()
  })

  it('can return the nodes', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 1, b: 'b' })

    expect(graph.getNodes()).toEqual([{ a: 1, b: 'b' }])

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 3, b: 'b' })
    graph.insert({ a: 4, b: 'b' })

    expect(graph.getNodes()).toContainEqual({ a: 1, b: 'b' })
    expect(graph.getNodes()).toContainEqual({ a: 2, b: 'b' })
    expect(graph.getNodes()).toContainEqual({ a: 3, b: 'b' })
    expect(graph.getNodes()).toContainEqual({ a: 4, b: 'b' })
  })

  it('can return the nodes sorted', () => {
    type NodeType = { a: number; b: string }
    const graph = new Graph<NodeType>((n: NodeType) => n.a.toFixed(2))

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 4, b: 'b' })
    graph.insert({ a: 1, b: 'b' })
    graph.insert({ a: 3, b: 'b' })

    expect(graph.getNodes((a, b) => a.a - b.a)).toEqual([
      { a: 1, b: 'b' },
      { a: 2, b: 'b' },
      { a: 3, b: 'b' },
      { a: 4, b: 'b' }
    ])
  })

  it('can get a specific node', () => {
    type NodeType = { a: number; b: string }
    const identityfn = (n: NodeType) => n.a.toFixed(2)
    const graph = new Graph<NodeType>(identityfn)

    const inputToRetrieve = { a: 1, b: 'c' }

    graph.insert({ a: 2, b: 'b' })
    graph.insert({ a: 4, b: 'b' })
    graph.insert(inputToRetrieve)
    graph.insert({ a: 3, b: 'b' })

    expect(graph.getNode(identityfn(inputToRetrieve))).toBeDefined()
    expect(graph.getNode(identityfn(inputToRetrieve))).toEqual(inputToRetrieve)
    expect(graph.getNode('nonsense')).toBeUndefined()
  })
})
import { TemporalGraph } from '../src/temporalGraph'
import {
  temporalDensity,
  edgeOverlapCount,
  interactionVelocity
} from '../src/metrics/graphMetrics'

describe('graphMetrics', () => {
  let graph: TemporalGraph<string, any>

  beforeEach(() => {
    graph = new TemporalGraph<string, any>((data) => data)
  })

  describe('temporalDensity', () => {
    it('should return 0 for empty graph', () => {
      expect(temporalDensity(graph, 0, 100)).toBe(0)
    })

    it('should return 0 for single node', () => {
      graph.insertNode('A')
      expect(temporalDensity(graph, 0, 100)).toBe(0)
    })

    it('should calculate density correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // 2 edges in interval
      // Max possible: 3 * 2 = 6 (directed, no self-loop)
      // Density: 2/6 = 1/3 ≈ 0.333
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)

      const density = temporalDensity(graph, 0, 50)
      expect(density).toBeCloseTo(1 / 3, 2)
    })

    it('should return 1 for complete graph', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // Max possible: 2 * 1 = 2
      // 2 edges = complete
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'A', 15, undefined, 25)

      const density = temporalDensity(graph, 0, 50)
      expect(density).toBe(1)
    })

    it('should only count edges in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 30, undefined, 40) // Outside interval

      // Window: 0-25, only 1 edge
      // Density: 1/6 ≈ 0.167
      const density = temporalDensity(graph, 0, 25)
      expect(density).toBeCloseTo(1 / 6, 2)
    })

    it('should handle larger graphs', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')
      graph.insertNode('D')

      // 3 edges
      // Max possible: 4 * 3 = 12
      // Density: 3/12 = 0.25
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)
      graph.addTemporalEdge('C', 'D', 20, undefined, 30)

      const density = temporalDensity(graph, 0, 50)
      expect(density).toBe(0.25)
    })
  })

  describe('edgeOverlapCount', () => {
    it('should return 0 for empty graph', () => {
      expect(edgeOverlapCount(graph)).toBe(0)
    })

    it('should return 0 for single edge', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      expect(edgeOverlapCount(graph)).toBe(0)
    })

    it('should count overlapping edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20
      // Edge 2: 15-25 (overlaps with 1)
      // Edge 3: 30-40 (no overlap)
      // Overlaps: 1 pair (1-2)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)
      graph.addTemporalEdge('A', 'C', 30, undefined, 40)

      expect(edgeOverlapCount(graph)).toBe(1)
    })

    it('should count all overlapping pairs', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')
      graph.insertNode('D')

      // All edges overlap: 10-20, 15-25, 12-22
      // Pairs: (1-2), (1-3), (2-3) = 3 overlaps
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)
      graph.addTemporalEdge('C', 'D', 12, undefined, 22)

      expect(edgeOverlapCount(graph)).toBe(3)
    })

    it('should handle non-overlapping edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // No overlaps
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 30, undefined, 40)

      expect(edgeOverlapCount(graph)).toBe(0)
    })

    it('should handle open intervals', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20
      // Edge 2: 15-∞ (overlaps with 1)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15) // No deactivation

      expect(edgeOverlapCount(graph)).toBe(1)
    })

    it('should handle adjacent edges (touching but not overlapping)', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20
      // Edge 2: 20-30 (touches but doesn't overlap)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 20, undefined, 30)

      expect(edgeOverlapCount(graph)).toBe(0)
    })
  })

  describe('interactionVelocity', () => {
    it('should return 0 for invalid interval', () => {
      graph.insertNode('A')
      expect(interactionVelocity(graph, 10, 5)).toBe(0)
      expect(interactionVelocity(graph, 10, 10)).toBe(0)
    })

    it('should calculate velocity per minute', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // 2 edges in 1 minute (60000ms)
      graph.addTemporalEdge('A', 'B', 0, undefined, 30000)
      graph.addTemporalEdge('B', 'C', 10000, undefined, 40000)

      // Window: 0-60000ms = 1 minute
      // Velocity: 2 edges / 1 minute = 2 edges/min
      const velocity = interactionVelocity(graph, 0, 60000)
      expect(velocity).toBeCloseTo(2, 1)
    })

    it('should handle partial minutes', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // 1 edge in 30 seconds (30000ms)
      graph.addTemporalEdge('A', 'B', 0, undefined, 15000)

      // Window: 0-30000ms = 0.5 minutes
      // Velocity: 1 edge / 0.5 minute = 2 edges/min
      const velocity = interactionVelocity(graph, 0, 30000)
      expect(velocity).toBeCloseTo(2, 1)
    })

    it('should only count edges in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 0, undefined, 30000)
      graph.addTemporalEdge('B', 'C', 70000, undefined, 100000) // Outside interval

      // Window: 0-60000ms = 1 minute
      // Only 1 edge in interval
      // Velocity: 1 edge / 1 minute = 1 edge/min
      const velocity = interactionVelocity(graph, 0, 60000)
      expect(velocity).toBeCloseTo(1, 1)
    })

    it('should return 0 when no edges in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 100000, undefined, 200000)

      // Window: 0-60000ms, no edges
      expect(interactionVelocity(graph, 0, 60000)).toBe(0)
    })
  })
})

import { TemporalGraph } from '../src/temporalGraph'
import {
  temporalDegree,
  nodeLifespan,
  nodeBurstiness
} from '../src/metrics/nodeMetrics'

describe('nodeMetrics', () => {
  let graph: TemporalGraph<string, any>

  beforeEach(() => {
    graph = new TemporalGraph<string, any>((data) => data)
  })

  describe('temporalDegree', () => {
    it('should return 0 for node with no edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      expect(temporalDegree(graph, 'A', 0, 100)).toBe(0)
    })

    it('should count edges connected to node in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // A -> B (10-20)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      // B -> C (15-25)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)
      // A -> C (30-40)
      graph.addTemporalEdge('A', 'C', 30, undefined, 40)

      // Node A: 2 edges (A->B, A->C) in interval 0-50
      expect(temporalDegree(graph, 'A', 0, 50)).toBe(2)

      // Node B: 2 edges (A->B, B->C) in interval 0-50
      expect(temporalDegree(graph, 'B', 0, 50)).toBe(2)

      // Node C: 2 edges (B->C, A->C) in interval 0-50
      expect(temporalDegree(graph, 'C', 0, 50)).toBe(2)
    })

    it('should only count edges in specified interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 30, undefined, 40)

      // Node B: only 1 edge in interval 25-50 (B->C)
      expect(temporalDegree(graph, 'B', 25, 50)).toBe(1)
    })

    it('should count both incoming and outgoing edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20) // B receives
      graph.addTemporalEdge('B', 'A', 15, undefined, 25) // B sends

      // Node B: 2 edges (incoming and outgoing)
      expect(temporalDegree(graph, 'B', 0, 50)).toBe(2)
    })
  })

  describe('nodeLifespan', () => {
    it('should return 0 for node with no edges', () => {
      graph.insertNode('A')
      expect(nodeLifespan(graph, 'A')).toBe(0)
    })

    it('should calculate lifespan correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // A's edges activate at: 10, 30
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('A', 'C', 30, undefined, 40)

      // Lifespan: 30 - 10 = 20ms
      expect(nodeLifespan(graph, 'A')).toBe(20)
    })

    it('should handle single edge', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)

      // Lifespan: 10 - 10 = 0ms (same activation time)
      expect(nodeLifespan(graph, 'A')).toBe(0)
    })

    it('should handle multiple edges with same activation', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('A', 'C', 10, undefined, 25)

      // Lifespan: 10 - 10 = 0ms
      expect(nodeLifespan(graph, 'A')).toBe(0)
    })

    it('should consider both incoming and outgoing edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // A sends at 10
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      // A receives at 30
      graph.addTemporalEdge('B', 'A', 30, undefined, 40)

      // Lifespan: 30 - 10 = 20ms
      expect(nodeLifespan(graph, 'A')).toBe(20)
    })
  })

  describe('nodeBurstiness', () => {
    it('should return 0 for less than 3 edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      expect(nodeBurstiness(graph, 'A')).toBe(0)

      graph.addTemporalEdge('A', 'B', 30, undefined, 40)
      expect(nodeBurstiness(graph, 'A')).toBe(0)
    })

    it('should calculate burstiness for regular intervals', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // Regular intervals: 10, 20, 30 (deltas: 10, 10)
      // Mean: 10, Std: 0
      // Burstiness: (0 - 10) / (0 + 10) = -1
      graph.addTemporalEdge('A', 'B', 10, undefined, 15)
      graph.addTemporalEdge('A', 'B', 20, undefined, 25)
      graph.addTemporalEdge('A', 'B', 30, undefined, 35)

      const burstiness = nodeBurstiness(graph, 'A')
      expect(burstiness).toBeCloseTo(-1, 2)
    })

    it('should calculate burstiness for bursty pattern', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Bursty: 10, 11, 12, 100 (deltas: 1, 1, 88)
      // Mean: ~30, Std: ~50
      // Burstiness should be positive (bursty)
      graph.addTemporalEdge('A', 'B', 10, undefined, 15)
      graph.addTemporalEdge('A', 'B', 11, undefined, 16)
      graph.addTemporalEdge('A', 'B', 12, undefined, 17)
      graph.addTemporalEdge('A', 'C', 100, undefined, 105)

      const burstiness = nodeBurstiness(graph, 'A')
      // Should be positive (closer to 1 = more bursty)
      expect(burstiness).toBeGreaterThan(0)
      expect(burstiness).toBeLessThanOrEqual(1)
    })

    it('should return 0 when mean is 0', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // All at same time (deltas: 0, 0)
      graph.addTemporalEdge('A', 'B', 10, undefined, 15)
      graph.addTemporalEdge('A', 'B', 10, undefined, 16)
      graph.addTemporalEdge('A', 'B', 10, undefined, 17)

      expect(nodeBurstiness(graph, 'A')).toBe(0)
    })

    it('should handle both incoming and outgoing edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // A sends: 10, 20
      graph.addTemporalEdge('A', 'B', 10, undefined, 15)
      graph.addTemporalEdge('A', 'C', 20, undefined, 25)
      // A receives: 30
      graph.addTemporalEdge('B', 'A', 30, undefined, 35)

      // Should calculate burstiness considering all edges
      const burstiness = nodeBurstiness(graph, 'A')
      expect(burstiness).toBeGreaterThanOrEqual(-1)
      expect(burstiness).toBeLessThanOrEqual(1)
    })
  })
})

import { DirectedAcyclicGraph, DirectedGraph, Graph } from '../src'

describe('The Readme', () => {
  it('runs the first example correctly', () => {
    // Identify the node type to be used with the graph
    type NodeType = { name: string; count: number; metadata: { [string: string]: string } }
    // Define a custom identity function with which to identify nodes
    const graph = new Graph<NodeType>((n: NodeType) => n.name)

    // Insert nodes into the graph
    const node1 = graph.insert({ name: 'node1', count: 45, metadata: { color: 'green' } })
    const node2 = graph.insert({
      name: 'node2',
      count: 5,
      metadata: { color: 'red', style: 'normal' }
    })
    const node3 = graph.insert({
      name: 'node3',
      count: 15,
      metadata: { color: 'blue', size: 'large' }
    })

    // Add edges between the nodes we created.
    graph.addEdge(node1, node2)
    graph.addEdge(node2, node3)

    const node: NodeType | undefined = graph.getNode(node2)

    expect(graph).toBeInstanceOf(Graph)
    expect(node).toBeDefined()
    expect(node?.count).toEqual(5)
  })

  it('runs the second example correctly', () => {
    // Create the graph
    type NodeType = { name: string; count: number }
    const graph = new DirectedGraph<NodeType>((n: NodeType) => n.name)

    // Insert nodes into the graph
    const node1 = graph.insert({ name: 'node1', count: 45 })
    const node2 = graph.insert({ name: 'node2', count: 5 })
    const node3 = graph.insert({ name: 'node3', count: 15 })

    // Check for cycles
    expect(graph.isAcyclic()).toBe(true) // true

    // Add edges between the nodes we created.
    graph.addEdge(node1, node2)
    graph.addEdge(node2, node3)

    // Check for cycles again
    expect(graph.isAcyclic()).toBe(true) // still true

    // Converts the graph into one that enforces acyclicality
    const dag = DirectedAcyclicGraph.fromDirectedGraph(graph)

    // Try to add an edge that will cause an cycle
    expect(() => dag.addEdge(node3, node1)).toThrow() // throws an exception

    // You can add the edge that would cause a cycle on the preview graph
    graph.addEdge(node3, node1)

    // Check for cycles again
    expect(graph.isAcyclic()).toBe(false) // now false

    expect(() => DirectedAcyclicGraph.fromDirectedGraph(graph)).toThrow() // now throws an exception because graph is not acyclic
  })

  it('runs the third example correctly', () => {
    // Create the graph
    type NodeType = { name: string }
    const graph = new DirectedAcyclicGraph<NodeType>((n: NodeType) => n.name)

    // Insert nodes into the graph
    const node1 = graph.insert({ name: 'node1' })
    const node2 = graph.insert({ name: 'node2' })
    const node3 = graph.insert({ name: 'node3' })
    const node4 = graph.insert({ name: 'node4' })
    const node5 = graph.insert({ name: 'node5' })

    // Add edges
    graph.addEdge(node1, node2)
    graph.addEdge(node2, node4)
    graph.addEdge(node1, node3)
    graph.addEdge(node3, node5)
    graph.addEdge(node5, node4)

    // Get the nodes in topologically sorted order
    expect(graph.topologicallySortedNodes()).toEqual([
      { name: 'node1' },
      { name: 'node3' },
      { name: 'node5' },
      { name: 'node2' },
      { name: 'node4' }
    ])
  })
})
import TemporalGraph from '../src/temporalGraph'

describe('TemporalGraph', () => {
  let graph: TemporalGraph<any>

  beforeEach(() => {
    graph = new TemporalGraph(n => n.id)
  })

  test('should add nodes and temporal edges', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.addTemporalEdge('A', 'B', 1, undefined, 5)

    const edges = graph.getTemporalEdges('A', 'B')
    expect(edges).toHaveLength(1)
    expect(edges[0]).toEqual({ start: 1, end: 5 })
  })

  test('should calculate earliest arrival path', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.insert({ id: 'C' })

    // A -> B (start: 1, end: 5)
    graph.addTemporalEdge('A', 'B', 1, undefined, 5)
    // B -> C (start: 6, end: 10)
    graph.addTemporalEdge('B', 'C', 6, undefined, 10)
    // B -> C (start: 4, end: 8) - cannot be taken if arriving at B at 5
    graph.addTemporalEdge('B', 'C', 4, undefined, 8)

    // Start at A at time 0
    const arrival = graph.earliestArrivalPath('A', 'C', 0)
    expect(arrival).toBe(10)
  })

  test('should return Infinity if not reachable', () => {
    graph.insert({ id: 'A' })
    graph.insert({ id: 'B' })
    graph.insert({ id: 'C' })

    // A -> B (start: 10, end: 15)
    graph.addTemporalEdge('A', 'B', 10, undefined, 15)
    // B -> C (start: 5, end: 8) - departs before arrival at B
    graph.addTemporalEdge('B', 'C', 5, undefined, 8)

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

    graph.addTemporalEdge('A', 'B', 1, undefined, 5)
    graph.addTemporalEdge('B', 'C', 6, undefined, 10)

    graph.addTemporalEdge('A', 'B', 10, undefined, 12)
    graph.addTemporalEdge('B', 'C', 12, undefined, 14)

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

    graph.addTemporalEdge('A', 'B', 1, undefined, 2)
    graph.addTemporalEdge('B', 'D', 3, undefined, 4)

    graph.addTemporalEdge('C', 'B', 1, undefined, 2)
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
import { TemporalGraph } from '../src/temporalGraph'
import {
  activeEdgeCountAt,
  totalActiveTime,
  averageActiveDuration,
  activationsInInterval,
  deactivationsInInterval,
  graphAliveRatio,
  temporalAcceleration,
  temporalSnapshot,
  temporalIntensity,
  activationRhythm,
  temporalOverlapRatio,
  temporalChangeRate
} from '../src/metrics/temporalMetrics'

describe('temporalMetrics', () => {
  let graph: TemporalGraph<string, any>

  beforeEach(() => {
    graph = new TemporalGraph<string, any>((data) => data)
  })

  describe('activeEdgeCountAt', () => {
    it('should return 0 when no edges exist', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      expect(activeEdgeCountAt(graph, 100)).toBe(0)
    })

    it('should count edges active at a specific time', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge active from 10 to 20
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      // Edge active from 15 to 25
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)

      expect(activeEdgeCountAt(graph, 5)).toBe(0) // Before any edge
      expect(activeEdgeCountAt(graph, 12)).toBe(1) // Only first edge
      expect(activeEdgeCountAt(graph, 18)).toBe(2) // Both edges
      expect(activeEdgeCountAt(graph, 22)).toBe(1) // Only second edge
      expect(activeEdgeCountAt(graph, 30)).toBe(0) // After all edges
    })

    it('should handle open intervals (no deactivation)', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10) // No deactivation

      expect(activeEdgeCountAt(graph, 5)).toBe(0)
      expect(activeEdgeCountAt(graph, 15)).toBe(1)
      expect(activeEdgeCountAt(graph, 1000)).toBe(1) // Still active
    })
  })

  describe('totalActiveTime', () => {
    it('should return 0 for empty interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)

      expect(totalActiveTime(graph, 0, 5)).toBe(0)
    })

    it('should calculate total active time correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20 (10ms active)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      // Edge 2: 15-25 (10ms active)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)

      // Window: 12-22
      // Edge 1: 12-20 = 8ms
      // Edge 2: 15-22 = 7ms
      // Total: 15ms
      expect(totalActiveTime(graph, 12, 22)).toBe(15)
    })

    it('should handle edges partially in window', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)

      // Window starts before edge
      expect(totalActiveTime(graph, 5, 15)).toBe(5)
      // Window ends after edge
      expect(totalActiveTime(graph, 15, 30)).toBe(5)
    })

    it('should handle open intervals', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10) // No deactivation

      // Window: 15-25, edge active from 10 to infinity
      // Active time: 25 - 15 = 10ms
      expect(totalActiveTime(graph, 15, 25)).toBe(10)
    })
  })

  describe('averageActiveDuration', () => {
    it('should return 0 when no edges in interval', () => {
      graph.insertNode('A')
      expect(averageActiveDuration(graph, 0, 100)).toBe(0)
    })

    it('should calculate average duration correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20 (10ms in window 5-25)
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      // Edge 2: 15-25 (10ms in window 5-25)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)

      // Window: 5-25
      // Edge 1: 10-20 = 10ms
      // Edge 2: 15-25 = 10ms
      // Average: (10 + 10) / 2 = 10ms
      expect(averageActiveDuration(graph, 5, 25)).toBe(10)
    })

    it('should handle partial overlaps', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)

      // Window: 15-25, edge active 15-20 = 5ms
      expect(averageActiveDuration(graph, 15, 25)).toBe(5)
    })
  })

  describe('activationsInInterval', () => {
    it('should count activations in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20) // Activation at 10
      graph.addTemporalEdge('B', 'C', 15, undefined, 25) // Activation at 15
      graph.addTemporalEdge('A', 'C', 25, undefined, 35) // Activation at 25

      expect(activationsInInterval(graph, 0, 5)).toBe(0)
      expect(activationsInInterval(graph, 10, 20)).toBe(2) // 10 and 15
      expect(activationsInInterval(graph, 20, 30)).toBe(1) // 25
      expect(activationsInInterval(graph, 10, 30)).toBe(3) // All
    })

    it('should include boundaries', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)

      expect(activationsInInterval(graph, 10, 10)).toBe(1)
      expect(activationsInInterval(graph, 10, 15)).toBe(1)
    })
  })

  describe('deactivationsInInterval', () => {
    it('should count deactivations in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20) // Deactivation at 20
      graph.addTemporalEdge('B', 'C', 15, undefined, 25) // Deactivation at 25
      graph.addTemporalEdge('A', 'C', 30, undefined, 40) // Deactivation at 40

      expect(deactivationsInInterval(graph, 0, 5)).toBe(0)
      expect(deactivationsInInterval(graph, 18, 22)).toBe(1) // 20
      expect(deactivationsInInterval(graph, 20, 30)).toBe(2) // 20 and 25
    })

    it('should ignore edges without deactivation', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10) // No deactivation

      expect(deactivationsInInterval(graph, 0, 100)).toBe(0)
    })
  })

  describe('graphAliveRatio', () => {
    it('should return 0 for invalid interval', () => {
      expect(graphAliveRatio(graph, 10, 5)).toBe(0)
      expect(graphAliveRatio(graph, 10, 10)).toBe(0)
    })

    it('should calculate alive ratio correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // Edge active 10ms out of 20ms window = 0.5
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)

      expect(graphAliveRatio(graph, 0, 20)).toBe(0.5)
    })

    it('should return 1 when fully active', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 0, undefined, 20)

      expect(graphAliveRatio(graph, 0, 20)).toBe(1)
    })
  })

  describe('temporalAcceleration', () => {
    it('should calculate acceleration correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)

      // At t=12: 1 edge active
      // At t=18: 2 edges active
      // Acceleration: 2 - 1 = 1
      expect(temporalAcceleration(graph, 12, 18)).toBe(1)
    })

    it('should return negative for deceleration', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)

      // At t=18: 2 edges active
      // At t=22: 1 edge active
      // Acceleration: 1 - 2 = -1
      expect(temporalAcceleration(graph, 18, 22)).toBe(-1)
    })
  })

  describe('temporalSnapshot', () => {
    it('should return snapshot at specific time', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)

      const snapshot = temporalSnapshot(graph, 18)

      expect(snapshot.nodes).toHaveLength(3)
      expect(snapshot.activeEdges).toHaveLength(2)
    })
  })

  describe('temporalIntensity', () => {
    it('should return 0 for invalid interval', () => {
      expect(temporalIntensity(graph, 10, 5)).toBe(0)
    })

    it('should calculate intensity per minute', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // 2 edges in 1 minute (60000ms)
      graph.addTemporalEdge('A', 'B', 0, undefined, 30000)
      graph.addTemporalEdge('B', 'C', 10000, undefined, 40000)

      // Window: 0-60000ms = 1 minute
      // 2 edges / 1 minute = 2 edges/min
      expect(temporalIntensity(graph, 0, 60000)).toBeCloseTo(2, 1)
    })
  })

  describe('activationRhythm', () => {
    it('should return 0 for less than 2 edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      expect(activationRhythm(graph)).toBe(0)
    })

    it('should calculate average interval between activations', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Activations at: 10, 20, 30
      // Intervals: 10ms, 10ms
      // Average: 10ms
      graph.addTemporalEdge('A', 'B', 10, undefined, 15)
      graph.addTemporalEdge('B', 'C', 20, undefined, 25)
      graph.addTemporalEdge('A', 'C', 30, undefined, 35)

      expect(activationRhythm(graph)).toBe(10)
    })
  })

  describe('temporalOverlapRatio', () => {
    it('should return 0 for 0 or 1 edges', () => {
      graph.insertNode('A')
      expect(temporalOverlapRatio(graph, 0, 100)).toBe(0)

      graph.insertNode('B')
      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      expect(temporalOverlapRatio(graph, 0, 100)).toBe(0)
    })

    it('should calculate overlap ratio', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20
      // Edge 2: 15-25 (overlaps with 1)
      // Edge 3: 30-40 (no overlap)
      // Total pairs: 3
      // Overlapping pairs: 1
      // Ratio: 1/3 ≈ 0.333

      graph.addTemporalEdge('A', 'B', 10, undefined, 20)
      graph.addTemporalEdge('B', 'C', 15, undefined, 25)
      graph.addTemporalEdge('A', 'C', 30, undefined, 40)

      const ratio = temporalOverlapRatio(graph, 0, 50)
      expect(ratio).toBeCloseTo(1 / 3, 2)
    })
  })

  describe('temporalChangeRate', () => {
    it('should return 0 for invalid interval', () => {
      expect(temporalChangeRate(graph, 10, 5)).toBe(0)
    })

    it('should calculate change rate per minute', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // 2 activations, 1 deactivation in 1 minute
      graph.addTemporalEdge('A', 'B', 0, undefined, 30000) // Activation at 0
      graph.addTemporalEdge('B', 'C', 20000, undefined, 40000) // Activation at 20000, deactivation at 40000

      // Window: 0-60000ms = 1 minute
      // Changes: 2 activations + 1 deactivation = 3 changes
      // Rate: 3 changes / 1 minute = 3 changes/min
      const rate = temporalChangeRate(graph, 0, 60000)
      expect(rate).toBeCloseTo(3, 1)
    })
  })
})

