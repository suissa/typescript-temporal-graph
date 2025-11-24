import { TemporalGraph, TemporalEdge } from "../temporalGraph"

/**
 * Conta quantas arestas estavam ativas exatamente em um timestamp.
 */
export function activeEdgeCountAt<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  time: number
): number {
  return graph.getActiveEdgesAt(time).length
}

/**
 * Soma total dos minutos ativos de todas as arestas durante [t0, t1].
 * Permite medir "intensidade temporal" do grafo.
 */
export function totalActiveTime<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  const edges = graph.getEdgesInInterval(t0, t1)
  let total = 0

  for (const e of edges) {
    const start = Math.max(e.activated_at, t0)
    const end = Math.min(e.deactivated_at ?? t1, t1)
    total += Math.max(0, end - start)
  }

  return total
}

/**
 * Tempo médio de ativação de uma aresta (duração média dentro da janela).
 */
export function averageActiveDuration<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  const edges = graph.getEdgesInInterval(t0, t1)
  if (edges.length === 0) return 0

  let sum = 0
  for (const e of edges) {
    const start = Math.max(e.activated_at, t0)
    const end = Math.min(e.deactivated_at ?? t1, t1)
    sum += Math.max(0, end - start)
  }

  return sum / edges.length
}

/**
 * Mede quantas arestas EXPLODIRAM (ativaram) dentro da janela.
 * Isso indica burst temporal e "avanços" de interação.
 */
export function activationsInInterval<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  return graph.getAllEdges().filter(
    e => e.activated_at >= t0 && e.activated_at <= t1
  ).length
}

/**
 * Mede quantas arestas MORRERAM (desativaram) na janela.
 * Ótimo para identificar perdas, quedas de interação, etc.
 */
export function deactivationsInInterval<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  return graph.getAllEdges().filter(
    e =>
      e.deactivated_at !== undefined &&
      e.deactivated_at >= t0 &&
      e.deactivated_at <= t1
  ).length
}

/**
 * Quão "vivo" está o grafo dentro da janela?
 * alive_ratio = totalTempoAtivo / duraçãoDaJanela
 */
export function graphAliveRatio<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  if (t1 <= t0) return 0
  const interval = t1 - t0
  const active = totalActiveTime(graph, t0, t1)
  return active / interval
}

/**
 * Mudança na quantidade de arestas ativas entre dois instantes.
 * Mede aceleração temporal.
 */
export function temporalAcceleration<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  const a0 = activeEdgeCountAt(graph, t0)
  const a1 = activeEdgeCountAt(graph, t1)
  return a1 - a0
}

/**
 * Retorna o snapshot do grafo em um instante t, como listas de nós e arestas ativas.
 */
export function temporalSnapshot<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  time: number
) {
  return {
    nodes: graph.getAllNodes(),
    activeEdges: graph.getActiveEdgesAt(time)
  }
}

/**
 * Intensidade temporal:
 * Número de eventos por unidade de tempo (ms → min).
 */
export function temporalIntensity<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  if (t1 <= t0) return 0

  const edges = graph.getEdgesInInterval(t0, t1).length
  const windowMinutes = (t1 - t0) / 60_000
  return edges / windowMinutes
}

/**
 * Tempo médio entre ativações sucessivas do grafo (toda vez que qualquer aresta ativa).
 * Indica ritmo global do grafo.
 */
export function activationRhythm<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>
): number {
  const times = graph
    .getAllEdges()
    .map(e => e.activated_at)
    .sort((a, b) => a - b)

  if (times.length < 2) return 0

  const intervals: number[] = []
  for (let i = 0; i < times.length - 1; i++) {
    intervals.push(times[i + 1] - times[i])
  }

  const sum = intervals.reduce((a, b) => a + b, 0)
  return sum / intervals.length
}

/**
 * Percentual de overlap temporal entre todas as arestas dentro da janela.
 */
export function temporalOverlapRatio<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  const edges = graph.getEdgesInInterval(t0, t1)
  if (edges.length <= 1) return 0

  let overlaps = 0

  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const a = edges[i]
      const b = edges[j]

      const aStart = a.activated_at
      const aEnd = a.deactivated_at ?? Infinity
      const bStart = b.activated_at
      const bEnd = b.deactivated_at ?? Infinity

      const overlap = aEnd >= bStart && bEnd >= aStart
      if (overlap) overlaps++
    }
  }

  const totalPairs = (edges.length * (edges.length - 1)) / 2
  return overlaps / totalPairs
}

/**
 * Mede quantas mudanças (ativação + desativação) o grafo sofreu por minuto.
 * É um índice de dinamismo.
 */
export function temporalChangeRate<NodeData, EdgeData>(
  graph: TemporalGraph<NodeData, EdgeData>,
  t0: number,
  t1: number
): number {
  if (t1 <= t0) return 0

  const activations = activationsInInterval(graph, t0, t1)
  const deactivations = deactivationsInInterval(graph, t0, t1)
  const total = activations + deactivations

  const windowMinutes = (t1 - t0) / 60_000
  return total / windowMinutes
}
