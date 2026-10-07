import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { ControleComissoes } from "./01/ControleComissoes.js";
import { ControleEstoque } from "./02/ControleEstoque.js";
import { CalculadoraJuros } from "./03/CalculadoraJuros.js";

const rl = createInterface({
  input: stdin,
  output: stdout,
});

try {
  console.log("Selecione um projeto:");
  console.log("1 - Controle de comissões");
  console.log("2 - Controle de estoque");
  console.log("3 - Calculadora de juros compostos");

  const opcao = (await rl.question("Opção: ")).trim();

  switch (opcao) {
    case "1":
      new ControleComissoes().executar();
      break;
    case "2":
      await new ControleEstoque().executar(rl);
      break;
    case "3":
      await new CalculadoraJuros().executar(rl);
      break;
    default:
      console.log("Opção inválida. Escolha um projeto entre 1 e 3.");
  }
} finally {
  rl.close();
}