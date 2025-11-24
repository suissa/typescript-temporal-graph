# TemporalGraph TS

## 📌 Visão Geral

TemporalGraph TS é uma biblioteca TypeScript projetada para modelar, analisar e visualizar **redes temporais**, grafos em que **as conexões possuem duração no tempo**, permitindo representar sistemas reais de forma dinâmica, contextual e historicamente consistente.

Enquanto grafos tradicionais representam relações estáticas, um **Temporal Graph** modela relações que **nascem, duram e morrem** ao longo do tempo. Isso permite análises impossíveis em grafos comuns, como:

* ritmo de interações
* recorrência
* intensidade temporal
* caminhos ordenados no tempo
* sobreposição de eventos
* aceleração / desaceleração
* períodos de inatividade
* padrões de burstiness
* ciclos temporais válidos
* evolução dinâmica de clusters

Essa lib fornece:

* Grafo temporal completo baseado em intervalos
* Conjunto enorme de métricas estruturais, semânticas e temporais
* Ferramentas de visualização (Plotly)
* Geração de dataset sintético
* Arquitetura modular (metrics/*)
* Compatível com GraphRAG / Temporal Graph RAG
* Uso genérico (não acoplado a WhatsApp ou CRM)

---

## 🧠 O Que é um Temporal Graph?

Um grafo tradicional é definido como:

```
G = (V, E)
```

Um **Temporal Graph** baseado em intervalos é:

```
Gₜ = (V, Eₜ)
Eₜ = { (u, v, [t_inicio, t_fim]) }
```

Onde cada **aresta possui um intervalo de ativação**:

* `activated_at`: quando a relação começa
* `deactivated_at`: quando termina (ou permanece aberta)

Isso transforma o grafo em uma estrutura dinâmica que evolui no tempo.

---

## 🎯 Por Que Usar Grafos Temporais?

## ✔ Representam o mundo real

O mundo é dinâmico: conversas, eventos, ações, sensores, microserviços, leads, tudo ocorre em uma sequência temporal.

Grafos estáticos **matam a narrativa**.

Grafos temporais **preservam o filme**, não só a foto.


## 🔥 Benefícios Práticos

### 🔹 Analisar interações reais

Whatsapp, CRM, e-commerce, suporte, IoT, microserviços.

### 🔹 Descobrir padrões temporais

Bursts, quedas, travamentos, escaladas de atividade.

### 🔹 Entender processos

Fluxo temporal → causa e efeito → caminhos válidos.

### 🔹 Base perfeita para IA

LLMs conseguem raciocinar melhor sobre dados temporais estruturados.


## 🧩 Estrutura da Biblioteca

```
src/
  temporalGraph.ts
  metrics/
    nodeMetrics.ts
    edgeMetrics.ts
    graphMetrics.ts
    temporalMetrics.ts
examples/
  generateSyntheticTemporalGraph.ts
  computeTemporalMetricsFromSynthetic.ts
visualizations/
  temporal_metrics.json
  temporal_metrics_plot.html
```

---

# 📦 Instalação

```bash
npm install temporal-graph-ts
```

---

## API Principal: TemporalGraph

### 🔹 TemporalNode

```ts
interface TemporalNode<T = any> {
  id: string
  data: T
}
```

### 🔹 TemporalEdge

```ts
interface TemporalEdge<T = any> {
  id: string
  from: string
  to: string
  created_at: number
  activated_at: number
  deactivated_at?: number
  data?: T
}
```

### 🔹 Criando um grafo temporal

```ts
import { TemporalGraph } from "temporal-graph-ts"

interface User { id: string; name: string }

const graph = new TemporalGraph<User, any>(u => u.id)

graph.insertNode({ id: "alice", name: "Alice" })
graph.insertNode({ id: "bob", name: "Bob" })

graph.addTemporalEdge("alice", "bob", Date.now())
```

---

# 🧪 Consultas Temporais

```ts
graph.getActiveEdgesAt(time)
graph.getEdgesInInterval(t0, t1)
graph.temporalShortestPath("alice", "carol")
graph.getOutgoingEdges("alice")
graph.getAllNodes()
graph.getAllEdges()
```

---

# 📊 Métricas

A biblioteca inclui **mais de 25 métricas temporais**, separadas em módulos:

---

## Node Metrics

### Imports:

```ts
import {
  temporalDegree,
  nodeLifespan,
  nodeBurstiness
} from "temporal-graph-ts/metrics/nodeMetrics"
```

### Métricas:

* Grau temporal
* Tempo de vida da atividade
* Burstiness (Barabási)

---

## Edge Metrics

### Imports:

```ts
import {
  edgeDuration,
  averageEdgeDurationBetween,
  edgeRecurrence
} from "temporal-graph-ts/metrics/edgeMetrics"
```

### Métricas:

* Duração de intervalos
* Recorrência
* Estabilidade

---

## Graph Metrics

### Imports:

```ts
import {
  temporalDensity,
  edgeOverlapCount,
  interactionVelocity
} from "temporal-graph-ts/metrics/graphMetrics"
```

### Métricas:

* Densidade temporal
* Overlap global
* Velocidade de interação

---

## Temporal Metrics (mais importantes)

### Imports:

```ts
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
} from "temporal-graph-ts/metrics/temporalMetrics"
```

### Métricas:

* Intensidade temporal
* Ritmo de ativações
* Mudança temporal
* Overlap temporal
* Snapshot temporal
* Tempo ativo acumulado
* Ativações/Desativações

# Explicação das Métricas do TemporalGraph TS (Uso no Mundo Real)

## 1. Grau Temporal (temporalDegree)

### **O que é**
Número de conexões ativas de um nó dentro de um intervalo de tempo.

### **Como interpretar**
Determina a relevância temporal do nó.

### **Usos reais**
* WhatsApp: quantos clientes falaram com o atendente nas últimas horas.
* CRM: leads mais ativos.
* Suporte: agentes com maior carga.
* IoT: dispositivo enviando múltiplos eventos.

## 2. Tempo de Vida da Atividade (nodeLifespan)

### **O que é**
Tempo entre a primeira e a última interação do nó.

### **Usos reais**
* Detectar leads que sumiram.
* Medir vida útil de sensores.
* Analisar tempo de engajamento em jornadas.

## 3. Burstiness (Barabási)

### **O que é**
Mede irregularidade de comportamento.

### **Usos reais**
* Leads impulsivos (resposta rápida em surtos).
* Fraudes (padrões regulares e robóticos).
* Emoção em conversas (mensagens longas + picos).

## 4. Duração de Intervalos (edgeDuration)

### **O que é**
Quanto tempo uma relação ficou ativa.

### **Usos reais**
* Sessões de conversa.
* Tempo conectado entre microserviços.
* Quanto um cliente permaneceu ativo.

## 5. Recorrência (edgeRecurrence)

### **O que é**
Quantas vezes a relação reapareceu.

### **Usos reais**
* Leads que voltam repetidamente.
* Suporte recorrente.
* Padrões comportamentais de retorno.

## 6. Estabilidade (averageEdgeDurationBetween)

### **O que é**
Duração média entre duas entidades ao longo do tempo.

### **Usos reais**
* Medir estabilidade Cliente ↔ Vendedor.
* Confiabilidade entre serviços.
* Duração média de interação.

## 7. Densidade Temporal (temporalDensity)

### **O que é**
Quão conectado o grafo está em uma janela temporal.

### **Usos reais**
* Identificar horas de pico.
* Analisar carga de operação.
* Mapear períodos de engajamento.

## 8. Overlap Global (edgeOverlapCount)

### **O que é**
Quantas relações existiram simultaneamente.

### **Usos reais**
* Congestionamento no atendimento.
* Requisições simultâneas.
* Momentos caóticos ou críticos.

## 9. Velocidade de Interação (interactionVelocity)

### **O que é**
Quantidade de interações criadas por minuto.

### **Usos reais**
* Leads quentes (resposta rápida).
* SLAs de suporte.
* Ritmos em redes sociais.

## 10. Intensidade Temporal (temporalIntensity)

### **O que é**
Quantidade de eventos por minuto.

### **Usos reais**
* Horários de maior propensão à conversão.
* Monitoramento de carga em serviços.
* Ritmo de uso em apps.

## 11. Ritmo de Ativações (activationRhythm)

### **O que é**
Tempo médio entre ativações.

### **Usos reais**
* Entender periodicidade.
* Detectar padrões humanos.
* Mapear ciclos de operação.

## 12. Mudança Temporal (temporalChangeRate)

### **O que é**
Quantidade de ativações + desativações por minuto.

### **Usos reais**
* Detectar anomalias.
* Mapear instabilidade.
* Rastrear eventos críticos.

## 13. Overlap Temporal (temporalOverlapRatio)

### **O que é**

Proporção de intervalos que se sobrepõem.

### **Usos reais**

* Atendimento simultâneo.
* Requisições concorrentes.
* Estouro operacional.

## 14. Snapshot Temporal (temporalSnapshot)

### **O que é**
Foto instantânea do grafo.

### **Usos reais**
* Dashboards.
* Debug.
* Contexto para GraphRAG.

## 15. Tempo Ativo Acumulado (totalActiveTime)

### **O que é**

Soma total de tempo de todas as relações.

### **Usos reais**

* Medir engajamento.
* Calcular uptime.
* Analisar carga operacional.

## 16. Ativações/Desativações

### **O que é**
Número de relações iniciadas/terminadas.

### **Usos reais**
* Leads iniciando vs encerrando.
* Sessões criadas/fechadas.
* Telemetria IoT.

## 🌎 Usos Reais no Mundo

### 1. CRM e Conversas (WhatsApp, Instagram, E-mail)

* medição de velocidade de resposta
* análise temporal de funil
* identificação de leads quentes
* previsão de abandono

### 2. E-commerce

* detecção de padrões de compra
* mapeamento de fricções temporais
* evolução de jornada

### 3. Suporte e Tickets

* SLA temporal real
* gargalos
* fluxo entre agentes

### 4. IoT e Sensores

* ativação/desativação
* correlação temporal
* picos e quedas

### 5. Sistemas Distribuídos

* rastreamento causal
* mensagens entre microserviços
* análise de latência real

### 6. Social Graphs

* surgimento de tópicos
* ondas virais
* propagação temporal

### 7. GraphRAG + LLMs

* memória temporal
* raciocínio causal
* reconstrução contextual

---

# 🧪 Dataset Sintético

Arquivo:

```
examples/generateSyntheticTemporalGraph.ts
```

Permite testar todo o motor da biblioteca.

---

# 📈 Visualização

Executar:

```
examples/computeTemporalMetricsFromSynthetic.ts
```

Gerará:

* `visualizations/temporal_metrics.json`
* `visualizations/temporal_metrics_plot.html`

O HTML mostra:

* Active Edge Count Over Time
* Temporal Intensity Over Time
