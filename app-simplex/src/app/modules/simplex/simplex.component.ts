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
  constructor() {
    this.variables = [];
    this.restricciones = [];
    this.objetivo = '';
  }

  matrixInicial() {
    let matrix = [];
    let totalFilas = this.restricciones.length + 1; // +1 por la fila de la función objetivo
    let totalColumnas = this.variables.length + this.restricciones.length + 1; // +1 por la columna de resultados (RHS)

    for(let i = 0;i<totalFilas;i++){
      let fila = [];
      for(let j = 0;j<totalColumnas;j++){
        if(i === 0 && j<this.variables.length){
          let negativo = (this.variables[j].multiplicador||0)*-1;
          fila.push(negativo);
        }
        else if(i === 0){
          fila.push(0);
        }

      }
      matrix.push(fila);
    }
    console.log(matrix);
  
  }

  ngOnInit() {
    console.log('SimplexComponent');
    console.log(this.variables.map((variable) => variable.multiplicador));
    console.log(this.restricciones);
    console.log(this.objetivo);

    for(let i = 0;i<this.restricciones.length+1;i++){
      if(i === 0){
        this.idFilas.push('z');
      }
      else{
        this.idFilas.push(this.restricciones[i-1].holgura?.id||'');
      }
    }

    console.log('Matrix Inicial');
    this.matrixInicial();
    console.log(this.idFilas);
  }
}
