import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import {
  createInterface,
  type Interface,
} from "node:readline/promises";
import { stdin, stdout } from "node:process";

interface Produto {
  codigoProduto: number;
  descricaoProduto: string;
  estoque: number;
}

interface Movimentacao {
  id: number;
  codigoProduto: number;
  descricao: string;
  tipo: "entrada" | "saida";
  quantidade: number;
}

interface DadosEstoque {
  estoque: Produto[];
  movimentacoes: Movimentacao[];
}

export class ControleEstoque {
  private readonly caminhoReferencia = new URL("./estoque.example.json", import.meta.url);
  private readonly caminhoDados = new URL("./estoque.json", import.meta.url);

  async executar(readline?: Interface): Promise<void> {
    const deveFecharReadline = readline === undefined;
    const rl = readline ?? createInterface({
      input: stdin,
      output: stdout,
    });

    try {
      await this.executarComReadline(rl);
    } finally {
      if (deveFecharReadline) {
        rl.close();
      }
    }
  }

  private async executarComReadline(rl: Interface): Promise<void> {
    const dados = this.carregarDados();

    console.log("Produtos:");

    for (const produto of dados.estoque) {
      console.log(
        `${produto.codigoProduto} - ${produto.descricaoProduto} (${produto.estoque} unidades)`,
      );
    }

    const codigoProduto = Number(
      await rl.question("\nCódigo do produto: "),
    );

    const produto = dados.estoque.find(
      (produto) => produto.codigoProduto === codigoProduto,
    );

    if (!produto) {
      console.log("Produto não encontrado.");
      return;
    }

    const tipo = await rl.question("Tipo (entrada/saida): ");

    if (tipo !== "entrada" && tipo !== "saida") {
      console.log("Tipo de movimentação inválido.");
      return;
    }

    const quantidade = Number(
      await rl.question("Quantidade: "),
    );

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      console.log("Quantidade inválida.");
      return;
    }

    if (tipo === "saida" && quantidade > produto.estoque) {
      console.log("Estoque insuficiente.");
      return;
    }

    const descricao = await rl.question(
      "Descrição da movimentação: ",
    );

    produto.estoque += tipo === "entrada"
      ? quantidade
      : -quantidade;

    // Captura o último id de movimentações
    const id = (dados.movimentacoes.at(-1)?.id ?? 0) + 1;

    dados.movimentacoes.push({
      id,
      codigoProduto: produto.codigoProduto,
      descricao,
      tipo,
      quantidade,
    });

    writeFileSync(
      this.caminhoDados,
      JSON.stringify(dados, null, 2),
    );

    console.log(`\nMovimentação ${id} registrada.`);
    console.log(
      `Estoque final de ${produto.descricaoProduto}: ${produto.estoque}`,
    );
  }

  private carregarDados(): DadosEstoque {
    if (!existsSync(this.caminhoDados)) {
      const exemplo = JSON.parse(
        readFileSync(this.caminhoReferencia, "utf8"),
      );

      const dados: DadosEstoque = {
        estoque: exemplo.estoque,
        movimentacoes: [],
      };

      writeFileSync(
        this.caminhoDados,
        JSON.stringify(dados, null, 2),
      );

      return dados;
    }

    return JSON.parse(
      readFileSync(this.caminhoDados, "utf8"),
    );
  }
}
