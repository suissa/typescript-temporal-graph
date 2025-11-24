// --- SETUP ---
import { LazyGraphEngine } from '../src/lazyGraphEngine';

const engine = new LazyGraphEngine();

// 1. Criar os nós
engine.createSource('Salario', 1000);
engine.createSource('Bonus', 500);

// Nó Soma Dinâmica: soma todos os argumentos que receber
engine.createComputed('RendaTotal', (...valores) => {
  return valores.reduce((acc, val) => acc + val, 0);
});

// 2. Criar as conexões temporais (Arestas)

// RendaTotal depende de Salario desde o início dos tempos (t=0)
engine.addDependency('RendaTotal', 'Salario', 0);

// RendaTotal SÓ começa a depender de Bonus a partir de t=11
engine.addDependency('RendaTotal', 'Bonus', 11);


// --- EXECUÇÃO ---

console.log("--- T=5 (Apenas Salário) ---");
// Deve calcular: Soma(1000) = 1000
console.log(`Resultado: ${engine.getValueAt('RendaTotal', 5)}`); 

console.log("\n--- T=15 (Salário + Bônus) ---");
// Deve calcular: Soma(1000, 500) = 1500
// Note que 'Salario' e 'Bonus' são resolvidos recursivamente apenas porque a aresta existe em T=15
console.log(`Resultado: ${engine.getValueAt('RendaTotal', 15)}`);

console.log("\n--- T=5 de novo (Teste de Cache) ---");
// Deve pegar do cache instantaneamente, sem "CALC" no log
console.log(`Resultado: ${engine.getValueAt('RendaTotal', 5)}`);