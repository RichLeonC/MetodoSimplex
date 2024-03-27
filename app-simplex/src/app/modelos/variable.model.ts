export class Variable{
    id: string;
    valor: number;
    multiplicador: number | null;
    constructor(id: string, valor: number, multiplicador: number | null){
        this.id = id;
        this.valor = valor;
        this.multiplicador = multiplicador;
    }
}