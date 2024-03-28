import { Component,OnInit,Input } from '@angular/core';
import { Variable } from '../../modelos/variable.model';
import { Restricion } from '../../modelos/restriccion.model';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-simplex',
  standalone: true,
  imports: [],
  templateUrl: './simplex.component.html',
  styleUrl: './simplex.component.scss'
})
export class SimplexComponent implements OnInit{
  @Input() variables: Array<Variable> = [];
  @Input() restricciones: Array<Restricion>;
  @Input() objetivo: string;
  idFilas: Array<string> = [];
  idColumnas: Array<string> = [];
  variableEntrante:string = '';
  variableSaliente:string = '';
  matrix:number[][] = [];
  constructor() {
    this.variables = [];
    this.restricciones = [];
    this.objetivo = '';

  }

  matrixInicial():number[][] {
    let matrix = [];
    let totalFilas = this.restricciones.length + 1; // +1 por la fila de la función objetivo
    let totalColumnas = this.variables.length + this.restricciones.length + 1; // +1 por la columna de resultados (RHS)

    for(let i = 0;i<totalFilas;i++){
      let fila = [];
      for(let j = 0;j<totalColumnas;j++){

        if(i === 0 && j<this.variables.length){ // Fila de la función objetivo 
          let negativo = (this.variables[j].multiplicador||0)*-1;
          fila.push(negativo);
        }
        else if(i === 0){  // Fila de la función objetivo (variables de holgura)
          fila.push(0);
        }
        else if(i>0 && j<this.variables.length){ // variables de las restricciones
          fila.push(this.restricciones[i-1].valores[j].multiplicador||0);
        }
        else if(i>0 && j === this.variables.length+(i-1)){ //variables de holgura
          fila.push(1);
        }
        else if(i>0 && j === totalColumnas-1){ // RHS
          fila.push(this.restricciones[i-1].resultado||0);
        }
        else{ 
          fila.push(0);
        }

      }
      matrix.push(fila);
    }

    return matrix;
  
  }

  llenarTablaIds(){
    let totalColumnas = this.variables.length + this.restricciones.length + 1;
    for(let i = 0;i<this.restricciones.length+1;i++){
      if(i === 0){
        this.idFilas.push('z');
       
      }
      else{
        this.idFilas.push(this.restricciones[i-1].holgura?.id||'');
      }
    }

    let holguras = 0;
    for(let i = 0;i<totalColumnas;i++){
      if(i<this.variables.length){
        this.idColumnas.push(this.variables[i].id||'');
      }
      else if(i === totalColumnas-1){
        this.idColumnas.push('RHS');
      }
      else{
        this.idColumnas.push(this.restricciones[holguras].holgura?.id||'');
        holguras++;
      }
    }
  }

  elementoMenor(){
    let menor = 0;
    for(let i = 0;i<this.matrix[0].length;i++){
      if(this.matrix[0][i]<menor){
        menor = this.matrix[0][i];
        this.variableEntrante = this.idColumnas[i];
        
      }
    }
  }

  radioMenor(){
    let radioMenor = 0;
    let esPrimero = true;
    let columnaMenor = this.idColumnas.indexOf(this.variableEntrante);
    let totalFilas = this.restricciones.length + 1;
    let filaRadioMenor = 0;

    for(let i = 1;i<totalFilas;i++){
      if(this.matrix[i][columnaMenor]>0){
        let rhs = this.matrix[i][this.matrix[i].length-1];
        let ele = this.matrix[i][columnaMenor];
        let radio = rhs/ele;
        if(radio<radioMenor || esPrimero){
          radioMenor = radio;
          filaRadioMenor = i;
          esPrimero = false;
        }
      }
    }
    this.variableSaliente = this.idFilas[filaRadioMenor];
    
  }

  ngOnInit() {
    console.log('SimplexComponent');

    this.llenarTablaIds();
    

    console.log('Matrix Inicial');
    this.matrix = this.matrixInicial();
    console.log(this.idFilas);
    console.log(this.idColumnas);
    console.log(this.matrix);

    console.log('Variable Entrante');
    this.elementoMenor();
    console.log(this.variableEntrante);
    this.radioMenor();
    console.log('Variable Saliente');
    console.log(this.variableSaliente);
  }
}
