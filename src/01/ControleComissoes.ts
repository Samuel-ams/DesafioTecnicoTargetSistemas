import { readFileSync } from "node:fs";

interface Venda {
  vendedor: string;
  valor: number;
}

interface DadosVendas {
  vendas: Venda[];
}

export class ControleComissoes {
  executar(): void {
    const dados = this.carregarVendas();
    const comissoes = this.calcularComissoes(dados.vendas);
    const formatarMoeda = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    console.log("Comissão por vendedor:");
    for (const [vendedor, valorEmCentavos] of comissoes) {
      console.log(`${vendedor}: ${formatarMoeda.format(valorEmCentavos / 100)}`);
    }
  }

  private carregarVendas(): DadosVendas {
    const caminhoArquivo = new URL("./vendasTimeComercial.json", import.meta.url);
    const conteudo = readFileSync(caminhoArquivo, "utf8");
    const dados: unknown = JSON.parse(conteudo);

    if (
      typeof dados !== "object" ||
      dados === null ||
      !("vendas" in dados) ||
      !Array.isArray(dados.vendas)
    ) {
      throw new Error('O arquivo de vendas deve conter uma lista chamada "vendas".');
    }

    for (const venda of dados.vendas) {
      if (
        typeof venda !== "object" ||
        venda === null ||
        !("vendedor" in venda) ||
        typeof venda.vendedor !== "string" ||
        venda.vendedor.trim() === "" ||
        !("valor" in venda) ||
        typeof venda.valor !== "number" ||
        !Number.isFinite(venda.valor) ||
        venda.valor < 0
      ) {
        throw new Error("O arquivo contém uma venda inválida.");
      }
    }

    return dados as DadosVendas;
  }

  // Vendas abaixo de R$100,00 não gera comissão
  // Vendas abaixo de R$500,00 gera 1% de comissão
  // A partir de R$500,00 gera 5% de comissão
  private calcularComissoes(vendas: Venda[]): Map<string, number> {
    const comissoes = new Map<string, number>();

    for (const venda of vendas) {
      const valorEmCentavos = Math.round(venda.valor * 100);
      // Ideia funcional, mas difícil de entender
      // const percentual = valorEmCentavos < 10_000 ? 0 : valorEmCentavos < 50_000 ? 1 : 5;
      // Ideia mais simples de entender
      let percentual = 0;
      if (valorEmCentavos >= 50_000) {
        percentual = 5;
      }else if(valorEmCentavos >= 10_000){
        percentual = 1;
      }
      const comissaoEmCentavos = Math.round((valorEmCentavos * percentual) / 100);
      const acumulado = comissoes.get(venda.vendedor) ?? 0;

      comissoes.set(venda.vendedor, acumulado + comissaoEmCentavos);
    }

    return comissoes;
  }
}
