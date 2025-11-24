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
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)

      const density = temporalDensity(graph, 0, 50)
      expect(density).toBeCloseTo(1 / 3, 2)
    })

    it('should return 1 for complete graph', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // Max possible: 2 * 1 = 2
      // 2 edges = complete
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'A', 15, 25)

      const density = temporalDensity(graph, 0, 50)
      expect(density).toBe(1)
    })

    it('should only count edges in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 30, 40) // Outside interval

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
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)
      graph.addTemporalEdge('C', 'D', 20, 30)

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

      graph.addTemporalEdge('A', 'B', 10, 20)
      expect(edgeOverlapCount(graph)).toBe(0)
    })

    it('should count overlapping edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20
      // Edge 2: 15-25 (overlaps with 1: 15-20)
      // Edge 3: 30-40 (no overlap)
      // Overlaps: 1 pair (1-2)
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)
      graph.addTemporalEdge('A', 'C', 30, 40)

      expect(edgeOverlapCount(graph)).toBe(1)
    })

    it('should count all overlapping pairs', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')
      graph.insertNode('D')

      // All edges overlap: 10-20, 15-25, 12-22
      // Pairs: (1-2), (1-3), (2-3) = 3 overlaps
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)
      graph.addTemporalEdge('C', 'D', 12, 22)

      expect(edgeOverlapCount(graph)).toBe(3)
    })

    it('should handle non-overlapping edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // No overlaps (20 < 30, so they don't touch)
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 30, 40)

      expect(edgeOverlapCount(graph)).toBe(0)
    })

    it('should handle open intervals', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20
      // Edge 2: 15-∞ (overlaps with 1)
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15) // No deactivation

      expect(edgeOverlapCount(graph)).toBe(1)
    })

    it('should handle adjacent edges (touching counts as overlap)', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20
      // Edge 2: 20-30 (touches at 20, which counts as overlap)
      // The condition aEnd >= bStart is true (20 >= 20)
      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 20, 30)

      expect(edgeOverlapCount(graph)).toBe(1)
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
      graph.addTemporalEdge('A', 'B', 0, 30000)
      graph.addTemporalEdge('B', 'C', 10000, 40000)

      // Window: 0-60000ms = 1 minute
      // Velocity: 2 edges / 1 minute = 2 edges/min
      const velocity = interactionVelocity(graph, 0, 60000)
      expect(velocity).toBeCloseTo(2, 1)
    })

    it('should handle partial minutes', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      // 1 edge in 30 seconds (30000ms)
      graph.addTemporalEdge('A', 'B', 0, 15000)

      // Window: 0-30000ms = 0.5 minutes
      // Velocity: 1 edge / 0.5 minute = 2 edges/min
      const velocity = interactionVelocity(graph, 0, 30000)
      expect(velocity).toBeCloseTo(2, 1)
    })

    it('should only count edges in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 0, 30000)
      graph.addTemporalEdge('B', 'C', 70000, 100000) // Outside interval

      // Window: 0-60000ms = 1 minute
      // Only 1 edge in interval
      // Velocity: 1 edge / 1 minute = 1 edge/min
      const velocity = interactionVelocity(graph, 0, 60000)
      expect(velocity).toBeCloseTo(1, 1)
    })

    it('should return 0 when no edges in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 100000, 200000)

      // Window: 0-60000ms, no edges
      expect(interactionVelocity(graph, 0, 60000)).toBe(0)
    })
  })
})

