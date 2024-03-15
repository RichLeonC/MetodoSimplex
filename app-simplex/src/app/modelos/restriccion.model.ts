import { Variable } from "./variable.model";

export class Restricion{
    id:number;
    valores: Variable[];
    operador: string;
    resultado: number;

    constructor(id:number, valores: Variable[], operador: string, resultado: number){
        this.id = id;
        this.valores = valores;
        this.operador = operador;
        this.resultado = resultado;
    }

}