import { Variable } from "./variable.model";

export class Restricion{
    id:number;
    valores: Variable[];
    operador: string;
    resultado: number| null;
    holgura: Variable | null;
    artificial: Variable | null;

    constructor(id:number, valores: Variable[], operador: string, resultado: number| null, holgura: Variable | null, artificial: Variable | null){
        this.id = id;
        this.valores = valores;
        this.operador = operador;
        this.resultado = resultado;
        this.holgura = holgura;
        this.artificial = artificial;
    }

}