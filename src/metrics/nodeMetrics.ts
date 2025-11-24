import { TemporalGraph } from '../temporalGraph'

/**
 * Grau temporal de um nó em [t0, t1]
 */
export function temporalDegree<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  nodeId: string,
  t0: number,
  t1: number
): number {
  const edges = graph.getEdgesInInterval(t0, t1)
  return edges.filter(e => e.from === nodeId || e.to === nodeId).length
}

/**
 * Lifespan do nó (primeira até última atividade)
 * Retorna 0 se não houver atividade.
 */
export function nodeLifespan<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  nodeId: string
): number {
  const edges = graph.getAllEdges().filter(
    e => e.from === nodeId || e.to === nodeId
  )
  if (edges.length === 0) return 0

  const times = edges
    .map(e => e.activated_at)
    .sort((a, b) => a - b)

  return times[times.length - 1] - times[0]
}

/**
 * Burstiness de Barabási adaptado:
 * B = (σ - μ) / (σ + μ)
 * Quanto mais perto de 1 → mais bursty
 */
export function nodeBurstiness<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  nodeId: string
): number {
  const times = graph
    .getAllEdges()
    .filter(e => e.from === nodeId || e.to === nodeId)
    .map(e => e.activated_at)
    .sort((a, b) => a - b)

  if (times.length < 3) return 0

  const deltas: number[] = []
  for (let i = 0; i < times.length - 1; i++) {
    deltas.push(times[i + 1] - times[i])
  }

  const mean =
    deltas.reduce((acc, v) => acc + v, 0) / deltas.length

  if (mean === 0) return 0

  const variance =
    deltas.reduce((acc, v) => acc + (v - mean) ** 2, 0) / deltas.length

  const std = Math.sqrt(variance)
  if (std + mean === 0) return 0

  return (std - mean) / (std + mean)
}
