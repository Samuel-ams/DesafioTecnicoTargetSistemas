import {
  createInterface,
  type Interface,
} from "node:readline/promises";
import { stdin, stdout } from "node:process";

export class CalculadoraJuros {
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
    const valor = Number(await rl.question("Valor: "));
    const dataTexto = await rl.question(
      "Data de vencimento (DD-MM-AAAA): "
    );

    const partesData = dataTexto.split("-");
    if (partesData.length !== 3) {
      console.log("Data inválida. Use o formato DD-MM-AAAA.");
      return;
    }

    const [dia, mes, ano] = partesData.map(Number);

    // validar apenas numeros
    // limitar dias entre 1 e 31
    // limitar meses entre 1 e 12
    if (
      !Number.isInteger(dia) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(ano) ||
      dia! < 1 ||
      dia! > 31 ||
      mes! < 1 ||
      mes! > 12
    ) {
      console.log("Data inválida.");
      return;
    }

    const vencimento = new Date(ano!, mes! - 1, dia!);

    // verificar ano, mes e dia
    // Ex: 30-02
    if (
      vencimento.getFullYear() !== ano ||
      vencimento.getMonth() !== mes! - 1 ||
      vencimento.getDate() !== dia
    ) {
      console.log("Data inválida.");
      return;
    }

    const hoje = new Date();

    vencimento.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    if (vencimento > hoje) {
      console.log("A data de vencimento não pode ser futura.");
      return;
    }

    const diasEmAtraso = Math.floor(
      (hoje.getTime() - vencimento.getTime()) / 86_400_000
    );

    // Montante = Capital × (1 + taxa)^tempo
    const total = valor * (1 + 0.025) ** diasEmAtraso;
    const juros = total - valor;

    console.log(`Dias em atraso: ${diasEmAtraso}`);
    console.log(`Juros: R$ ${juros.toFixed(2)}`);
    console.log(`Total atualizado: R$ ${total.toFixed(2)}`);
  }
}