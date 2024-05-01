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
  idColumnasIteraciones: Array<Array<string>> = [];
  entrantes: Array<string> = [];
  salientes: Array<string> = [];

  hayInfinidad = false;

  nArtificiales = 0;
  nHolguras = 0;

  comenzoFase1 = false;
  comenzarFase2 = false;
  comenzoConvertir0Artificiales = false;

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
    let totalColumnas = this.variables.length + this.nHolguras + this.nArtificiales + 1;
    let totalFilas = this.restricciones.length + 1;
    if (esDosFases) {
      totalFilas += 1;
    }

    for (let i = 0; i < totalFilas; i++) {
      if (i === 0 && !esDosFases) {
        this.idFilas.push('z');

      }
      else if (i === 0 && esDosFases) {
        this.idFilas.push('-w');
      }
      else if (i === 1 && esDosFases) {
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

    for (let i = 0; i < totalColumnas; i++) {

      if (i < this.variables.length) {
        this.idColumnas.push(this.variables[i].id || '');
      }

    }
    this.llenarHolguras();
    this.llenarArtificiales();
    this.idColumnas.push('RHS');
  }

  llenarHolguras() {
    for (let i = this.variables.length; i < this.variables.length + this.nHolguras; i++) {
      for (let j = 0; j < this.restricciones.length; j++) {
        if (this.restricciones[j].holgura?.id !== undefined) {
          if (!this.idColumnas.includes(this.restricciones[j].holgura?.id ?? ''))
            this.idColumnas.push(this.restricciones[j].holgura?.id ?? '');
        }
      }

    }
  }

  llenarArtificiales() {
    let comienzoArt = this.variables.length + this.nHolguras;
    for (let i = comienzoArt; i < comienzoArt + this.nArtificiales; i++) {
      for (let j = 0; j < this.restricciones.length; j++) {
        if (this.restricciones[j].artificial?.id !== undefined) {
          if (!this.idColumnas.includes(this.restricciones[j].artificial?.id ?? ''))
            this.idColumnas.push(this.restricciones[j].artificial?.id ?? '');
        }
      }
    }
  }

  elementoMenor() { //Encuentra el elemento menor de la fila 0
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

  radioMenor(esDosFases: boolean = false) {
    let index = 1;
    let totalFilas = this.restricciones.length + 1;
    if (esDosFases && this.comenzoFase1) {
      index = 2;
      totalFilas += 1;
    }
    let radioMenor = 0;
    let esPrimero = true;
    let columnaMenor = this.idColumnas.indexOf(this.variableEntrante);


    let filaRadioMenor = 0;

    if (!this.columnaNegativa(columnaMenor, totalFilas)) {
      for (let i = index; i < totalFilas; i++) {
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
    this.idColumnasIteraciones.push(JSON.parse(JSON.stringify(this.idColumnas)));
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

          if (Math.abs(this.matrix[i][j]) < 0.01) {
            this.matrix[i][j] = 0;
          }
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
    this.comenzoFase1 = true;
    this.matrix = this.matrixFase1();
    this.inicialMatrix = JSON.parse(JSON.stringify(this.matrix));

    this.fase1();

  }

  matrixFase1(): number[][] {
    let totalFilas = this.restricciones.length + 2; // +2 por la fila de la función objetivo y la fila W
    let totalColumnas = this.variables.length + this.nHolguras + this.nArtificiales + 1; // +1 por la columna de resultados (RHS)
    let matrix = [];
    console.log(this.idColumnas);
    for (let i = 0; i < totalFilas; i++) {
      let fila = [];
      for (let j = 0; j < totalColumnas; j++) {

        if (i === 0 && !this.idColumnas[j].includes('s') && !this.idColumnas[j].includes('a')) {//Fila -W
          fila.push(0);
        }
        else if (i === 0 && this.idColumnas[j].includes('a')) {//Fila -W, variables Artificiales sin Holguras
          fila.push(1);
        }
        else if (i === 0) {// Fila -W, RHS
          fila.push(0);
        }
        else if (i === 1 && j < this.variables.length) {//Fila Z
          let negativo = (this.variables[j].multiplicador || 0) * -1;
          fila.push(negativo);
        }
        else if (i === 1 && j >= this.variables.length && j < totalColumnas) {//Fila Z, variables de holgura, artificiales y RHS
          fila.push(0);
        }
        else if (i > 1 && j < this.variables.length) {//variables de las Restricciones
          fila.push(this.restricciones[i - 2].valores[j].multiplicador || 0);
        }
        else if (i > 1 && j === this.variables.length + (i - 2) && this.nHolguras > 0) {//variables de holgura
          fila.push(this.restricciones[i - 2].holgura?.valor || 0);
        }
        else if (i > 1 && this.idFilas[i] === this.idColumnas[j]) {//variables artificiales
          //fila.push(this.restricciones[i-2].artificial?.valor || 0);
          fila.push(1);
        }
        else if (i > 1 && j === totalColumnas - 1) {//RHS
          fila.push(this.restricciones[i - 2].resultado || 0);
        }
        else {
          fila.push(0);
        }

      }
      matrix.push(fila);
    }

    return matrix;

  }

  fase1() {
    this.convierteArtificalesEnCero();
    this.comenzoConvertir0Artificiales = false;
    while (this.hayNegativos()) {
      this.elementoMenor();
      this.radioMenor(true);
      if (this.hayInfinidad) break;
      this.conviertePivoteEnUno();
      this.convierteRestoEnCero();


    }


    if (!this.hayInfinidad) {
      if (this.esFactible()) {
        this.fase2();
      }
    }

  }

  fase2() {
    console.log("Fase 2");
    this.comenzoFase1 = false;
    this.comenzarFase2 = true;
    this.matrix.splice(0, 1); //Elimina la fila -W
    this.idFilas.splice(0, 1); //Elimina la fila -W

    this.matrix = this.matrix.map(f => {
      return f.filter((_, i) => !this.idColumnas[i].includes('a'));
    });

    this.idColumnas = this.idColumnas.filter(e => !e.includes('a'));

    this.idFilasIteraciones.push(JSON.parse(JSON.stringify(this.idFilas)));
    this.idColumnasIteraciones.push(JSON.parse(JSON.stringify(this.idColumnas)));
    this.iteraciones.push(JSON.parse(JSON.stringify(this.matrix)));



    
  }

  esFactible(): boolean {
    let factible = true;
    this.idFilas.forEach(e => {
      if (e.includes('a')) {
        factible = false;
      }
    });
    return factible;
  }

  convierteArtificalesEnCero() {
    this.comenzoConvertir0Artificiales = true;
    for (let i = 0; i < this.nArtificiales; i++) {
      let index = this.variables.length + this.nHolguras + i;
      this.variableEntrante = this.idColumnas[index];
      this.idFilasIteraciones.push(JSON.parse(JSON.stringify(this.idFilas)));
      this.idColumnasIteraciones.push(JSON.parse(JSON.stringify(this.idColumnas)));
      this.convierteRestoEnCero();
    }

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
      if (e.holgura != null) this.nHolguras++;
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
