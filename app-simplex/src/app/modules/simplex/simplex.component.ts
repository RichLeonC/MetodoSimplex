import { Component, OnInit, Input } from '@angular/core';
import { Variable } from '../../modelos/variable.model';
import { Restricion } from '../../modelos/restriccion.model';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-simplex',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simplex.component.html',
  styleUrl: './simplex.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SimplexComponent implements OnInit {
  @Input() variables: Array<Variable> = [];
  @Input() restricciones: Array<Restricion>;
  @Input() objetivo: string;
  @Input() metodo: string;
  idFilas: Array<string> = [];
  idColumnas: Array<string> = [];
  variableEntrante: string = '';
  variableSaliente: string = '';
  matrix: number[][] = [];
  resultados: Array<number> = [];
  inicialMatrix: number[][] = [];
  iteraciones: Array<number[][]> = [];
  idFilasInicial: Array<string> = [];
  idFilasIteraciones: Array<Array<string>> = [];
  entrantes: Array<string> = [];
  salientes: Array<string> = [];

  hayInfinidad = false;

  nArtificiales = 0;
  constructor() {
    this.variables = [];
    this.restricciones = [];
    this.objetivo = '';
    this.metodo = '';

  }

  matrixInicial(): number[][] {
    let matrix = [];
    let totalFilas = this.restricciones.length + 1; // +1 por la fila de la función objetivo
    let totalColumnas = this.variables.length + this.restricciones.length + 1; // +1 por la columna de resultados (RHS)

    for (let i = 0; i < totalFilas; i++) {
      let fila = [];
      for (let j = 0; j < totalColumnas; j++) {

        if (i === 0 && j < this.variables.length) { // Fila de la función objetivo 
          let negativo = (this.variables[j].multiplicador || 0) * -1;
          fila.push(negativo);
        }
        else if (i === 0) {  // Fila de la función objetivo (variables de holgura)
          fila.push(0);
        }
        else if (i > 0 && j < this.variables.length) { // variables de las restricciones
          fila.push(this.restricciones[i - 1].valores[j].multiplicador || 0);
        }
        else if (i > 0 && j === this.variables.length + (i - 1)) { //variables de holgura
          fila.push(1);
        }
        else if (i > 0 && j === totalColumnas - 1) { // RHS
          fila.push(this.restricciones[i - 1].resultado || 0);
        }
        else {
          fila.push(0);
        }

      }
      matrix.push(fila);
    }

    return matrix;

  }

  llenarTablaIds(esDosFases: boolean) {
    let totalColumnas = this.variables.length + this.restricciones.length + 1;
    let totalFilas = this.restricciones.length + 1;
    if(esDosFases){
      totalFilas += 1;
      totalColumnas += this.nArtificiales;
    } 

    for (let i = 0; i < totalFilas; i++) {
      if (i === 0 && !esDosFases) {
        this.idFilas.push('z');

      }
      else if (i === 0 && esDosFases) {
        this.idFilas.push('-w');
      }
      else if(i===1 && esDosFases){
        this.idFilas.push('z');
      }
      else if (esDosFases) {
        this.idFilas.push(this.restricciones[i - 2].artificial?.id || this.restricciones[i - 2].holgura?.id || '');
      }
      else {
        this.idFilas.push(this.restricciones[i - 1].holgura?.id || '');
      }
    }
    this.idFilasInicial = JSON.parse(JSON.stringify(this.idFilas));

    let holguras = 0;
    let artificiales = 0;
    for (let i = 0; i < totalColumnas; i++) {
      if (i < this.variables.length) {
        this.idColumnas.push(this.variables[i].id || '');
      }
      else if (i === totalColumnas - 1) {
        this.idColumnas.push('RHS');
      }
      else if(i >= this.variables.length && i < this.variables.length + this.restricciones.length){ //variables de holgura
        this.idColumnas.push(this.restricciones[holguras].holgura?.id || '');
        holguras++;
      }
      else if(i >= this.variables.length + this.restricciones.length && i < totalColumnas - 1){ //variables artificiales
        this.idColumnas.push(this.restricciones[artificiales].artificial?.id || '');
        artificiales++;
      }

    }
  }

  elementoMenor() {
    let menor = 0;
    for (let i = 0; i < this.matrix[0].length; i++) {
      if (this.matrix[0][i] < menor) {
        menor = this.matrix[0][i];
        this.variableEntrante = this.idColumnas[i];

      }
    }
    this.entrantes.push(this.variableEntrante);
  }

  columnaNegativa(columna: number, totalFilas: number): boolean {
    let negativos = 0;

    for (let i = 1; i < this.matrix.length; i++) {
      if (this.matrix[i][columna] < 0) {
        negativos++;
      }
    }


    return negativos === totalFilas - 1 ? true : false;

  }

  radioMenor() {
    let radioMenor = 0;
    let esPrimero = true;
    let columnaMenor = this.idColumnas.indexOf(this.variableEntrante);
    let totalFilas = this.restricciones.length + 1;
    let filaRadioMenor = 0;

    if (!this.columnaNegativa(columnaMenor, totalFilas)) {
      for (let i = 1; i < totalFilas; i++) {
        if (this.matrix[i][columnaMenor] > 0) {
          let rhs = this.matrix[i][this.matrix[i].length - 1];
          let ele = this.matrix[i][columnaMenor];
          let radio = rhs / ele;
          if (radio < radioMenor || esPrimero) {
            radioMenor = radio;
            filaRadioMenor = i;
            esPrimero = false;
          }
        }

      }
      this.variableSaliente = this.idFilas[filaRadioMenor];
      this.salientes.push(this.variableSaliente);
    }
    else {
      this.hayInfinidad = true;
    }



  }

  conviertePivoteEnUno() {
    this.idFilas[this.idFilas.indexOf(this.variableSaliente)] = this.variableEntrante;
    this.idFilasIteraciones.push(JSON.parse(JSON.stringify(this.idFilas)));
    let fila = this.idFilas.indexOf(this.variableEntrante);
    let pivote = this.matrix[fila][this.idColumnas.indexOf(this.variableEntrante)];
    let inversoPivote = 1 / pivote;
    for (let i = 0; i < this.matrix[fila].length; i++) {
      this.matrix[fila][i] = +(this.matrix[fila][i] * inversoPivote).toPrecision(3);
    }
  }

  convierteRestoEnCero() {
    let fila = this.idFilas.indexOf(this.variableEntrante);
    let columna = this.idColumnas.indexOf(this.variableEntrante);
    for (let i = 0; i < this.matrix.length; i++) {
      if (i !== fila) {
        let factor = this.matrix[i][columna] * -1;
        for (let j = 0; j < this.matrix[i].length; j++) {
          this.matrix[i][j] = +(this.matrix[i][j] + (this.matrix[fila][j] * factor)).toPrecision(3);
        }
      }
    }
    this.iteraciones.push(JSON.parse(JSON.stringify(this.matrix)));

  }

  hayNegativos() {
    let hayNegativos = false;
    for (let i = 0; i < this.matrix[0].length; i++) {
      if (this.matrix[0][i] < 0) {
        hayNegativos = true;
        break;
      }
    }
    return hayNegativos;
  }



  simplex() {
    this.llenarTablaIds(false);
    this.matrix = this.matrixInicial();
    this.inicialMatrix = JSON.parse(JSON.stringify(this.matrix));

    while (this.hayNegativos()) {
      this.elementoMenor();
      this.radioMenor();
      if (this.hayInfinidad) break;
      this.conviertePivoteEnUno();
      this.convierteRestoEnCero();

    }
    if (!this.hayInfinidad) this.solucionOptima();


  }

  solucionOptima() {
    let ultimaColumna = this.variables.length + this.restricciones.length + 1;
    let totalFilas = this.restricciones.length + 1;
    for (let i = 0; i < totalFilas; i++) {
      let rhs = this.matrix[i][ultimaColumna - 1];
      this.resultados.push(rhs);
    }
  }

  dosFases() {
    this.llenarTablaIds(true);
    console.log(this.idFilas);
    console.log(this.idColumnas);
   // this.fase1();

  }

  matrixFase1() {
    let totalFilas = this.restricciones.length + 2; // +2 por la fila de la función objetivo y la fila W
    let totalColumnas = this.variables.length + this.restricciones.length + this.nArtificiales + 1; // +1 por la columna de resultados (RHS)
    let matrix = [];




  }

  fase1() {

  }

  granM() {

  }

  ngOnInit() {
    let hayArtificiales = false;
    this.restricciones.forEach(e => {
      if (e.artificial != null) {
        this.nArtificiales++;
        hayArtificiales = true;

      };
    });

    if (!hayArtificiales && this.metodo === 'Fases') {
      this.simplex();
    }
    if (!hayArtificiales && this.metodo === 'M') {

    }
    if (hayArtificiales && this.metodo === 'Fases') {
      this.dosFases();
    }
    if (hayArtificiales && this.metodo === 'M') {
      this.granM();
    }


  }
}
