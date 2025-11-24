import { TemporalGraph } from '../temporalGraph'

/**
 * Quantidade de arestas ativas em [t0, t1] normalizada pelo número
 * máximo possível de arestas (n * (n-1)), ignorando self-loop.
 */
export function temporalDensity<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  const nodes = graph.getAllNodes()
  const n = nodes.length
  if (n <= 1) return 0

  const edgesInInterval = graph.getEdgesInInterval(t0, t1).length
  const maxPossible = n * (n - 1) // directed graph, sem self-loop
  return edgesInInterval / maxPossible
}

/**
 * Overlap de intervalos de arestas (quantos pares se sobrepõem no tempo)
 */
export function edgeOverlapCount<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>
): number {
  const edges = graph.getAllEdges()
  let count = 0

  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const a = edges[i]
      const b = edges[j]

      const aStart = a.activated_at
      const aEnd = a.deactivated_at ?? Infinity
      const bStart = b.activated_at
      const bEnd = b.deactivated_at ?? Infinity

      const overlap = aEnd >= bStart && bEnd >= aStart
      if (overlap) count++
    }
  }

  return count
}

/**
 * "Velocidade" de interação: número de arestas em [t0, t1]
 * dividido pela largura da janela (em minutos).
 */
export function interactionVelocity<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  if (t1 <= t0) return 0
  const edges = graph.getEdgesInInterval(t0, t1).length
  const windowMinutes = (t1 - t0) / 60_000
  if (windowMinutes === 0) return 0
  return edges / windowMinutes
}
