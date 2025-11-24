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
      graph.addTemporalEdge('A', 'B', 10, 20)
      // Edge active from 15 to 25
      graph.addTemporalEdge('B', 'C', 15, 25)

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
      graph.addTemporalEdge('A', 'B', 10, 20)

      expect(totalActiveTime(graph, 0, 5)).toBe(0)
    })

    it('should calculate total active time correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Edge 1: 10-20 (10ms active)
      graph.addTemporalEdge('A', 'B', 10, 20)
      // Edge 2: 15-25 (10ms active)
      graph.addTemporalEdge('B', 'C', 15, 25)

      // Window: 12-22
      // Edge 1: 12-20 = 8ms
      // Edge 2: 15-22 = 7ms
      // Total: 15ms
      expect(totalActiveTime(graph, 12, 22)).toBe(15)
    })

    it('should handle edges partially in window', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, 20)

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
      graph.addTemporalEdge('A', 'B', 10, 20)
      // Edge 2: 15-25 (10ms in window 5-25)
      graph.addTemporalEdge('B', 'C', 15, 25)

      // Window: 5-25
      // Edge 1: 10-20 = 10ms
      // Edge 2: 15-25 = 10ms
      // Average: (10 + 10) / 2 = 10ms
      expect(averageActiveDuration(graph, 5, 25)).toBe(10)
    })

    it('should handle partial overlaps', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, 20)

      // Window: 15-25, edge active 15-20 = 5ms
      expect(averageActiveDuration(graph, 15, 25)).toBe(5)
    })
  })

  describe('activationsInInterval', () => {
    it('should count activations in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, 20) // Activation at 10
      graph.addTemporalEdge('B', 'C', 15, 25) // Activation at 15
      graph.addTemporalEdge('A', 'C', 25, 35) // Activation at 25

      expect(activationsInInterval(graph, 0, 5)).toBe(0)
      expect(activationsInInterval(graph, 10, 20)).toBe(2) // 10 and 15
      expect(activationsInInterval(graph, 20, 30)).toBe(1) // 25
      expect(activationsInInterval(graph, 10, 30)).toBe(3) // All
    })

    it('should include boundaries', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, 20)

      expect(activationsInInterval(graph, 10, 10)).toBe(1)
      expect(activationsInInterval(graph, 10, 15)).toBe(1)
    })
  })

  describe('deactivationsInInterval', () => {
    it('should count deactivations in interval', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, 20) // Deactivation at 20
      graph.addTemporalEdge('B', 'C', 15, 25) // Deactivation at 25
      graph.addTemporalEdge('A', 'C', 30, 40) // Deactivation at 40

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
      graph.addTemporalEdge('A', 'B', 10, 20)

      expect(graphAliveRatio(graph, 0, 20)).toBe(0.5)
    })

    it('should return 1 when fully active', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 0, 20)

      expect(graphAliveRatio(graph, 0, 20)).toBe(1)
    })
  })

  describe('temporalAcceleration', () => {
    it('should calculate acceleration correctly', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)

      // At t=12: 1 edge active
      // At t=18: 2 edges active
      // Acceleration: 2 - 1 = 1
      expect(temporalAcceleration(graph, 12, 18)).toBe(1)
    })

    it('should return negative for deceleration', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)

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

      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)

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
      graph.addTemporalEdge('A', 'B', 0, 30000)
      graph.addTemporalEdge('B', 'C', 10000, 40000)

      // Window: 0-60000ms = 1 minute
      // 2 edges / 1 minute = 2 edges/min
      expect(temporalIntensity(graph, 0, 60000)).toBeCloseTo(2, 1)
    })
  })

  describe('activationRhythm', () => {
    it('should return 0 for less than 2 edges', () => {
      graph.insertNode('A')
      graph.insertNode('B')

      graph.addTemporalEdge('A', 'B', 10, 20)
      expect(activationRhythm(graph)).toBe(0)
    })

    it('should calculate average interval between activations', () => {
      graph.insertNode('A')
      graph.insertNode('B')
      graph.insertNode('C')

      // Activations at: 10, 20, 30
      // Intervals: 10ms, 10ms
      // Average: 10ms
      graph.addTemporalEdge('A', 'B', 10, 15)
      graph.addTemporalEdge('B', 'C', 20, 25)
      graph.addTemporalEdge('A', 'C', 30, 35)

      expect(activationRhythm(graph)).toBe(10)
    })
  })

  describe('temporalOverlapRatio', () => {
    it('should return 0 for 0 or 1 edges', () => {
      graph.insertNode('A')
      expect(temporalOverlapRatio(graph, 0, 100)).toBe(0)

      graph.insertNode('B')
      graph.addTemporalEdge('A', 'B', 10, 20)
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

      graph.addTemporalEdge('A', 'B', 10, 20)
      graph.addTemporalEdge('B', 'C', 15, 25)
      graph.addTemporalEdge('A', 'C', 30, 40)

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
      graph.addTemporalEdge('A', 'B', 0, 30000) // Activation at 0
      graph.addTemporalEdge('B', 'C', 20000, 40000) // Activation at 20000, deactivation at 40000

      // Window: 0-60000ms = 1 minute
      // Changes: 2 activations + 1 deactivation = 3 changes
      // Rate: 3 changes / 1 minute = 3 changes/min
      const rate = temporalChangeRate(graph, 0, 60000)
      expect(rate).toBeCloseTo(3, 1)
    })
  })
})

