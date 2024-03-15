export class Variable{
    id: string;
    valor: number;
    multiplicador: number;
    constructor(id: string, valor: number, multiplicador: number){
        this.id = id;
        this.valor = valor;
        this.multiplicador = multiplicador;
    }
}