import { Component,Input,OnInit,NgModule } from '@angular/core';
import { FormBuilder,Validators,FormGroup,ReactiveFormsModule, FormArray,FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { get } from 'http';
import { Variable } from '../../modelos/variable.model';
import { Restricion } from '../../modelos/restriccion.model';
import { SimplexComponent } from '../simplex/simplex.component';


@Component({
  selector: 'app-modelaje',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,SimplexComponent],
  templateUrl: './modelaje.component.html',
  styleUrl: './modelaje.component.scss'
})


export class ModelajeComponent implements OnInit{
  @Input() formInicial!: FormGroup;
  formModelaje: FormGroup;
  variables: Array<Variable> = [];
  restricciones: Array<Restricion> = [];
  objetivo: string = '';
  modelajeAprobado = false;
  metodo: string = '';

  contador = 1;
  contadorArtificiales = 1;

  variablesDisponibles: Array<string> = [];
  variablesLibres: Array<string> = [];
  variableSeleccionada: string = '';

  constructor(private fb: FormBuilder) {
    this.formModelaje = this.fb.group({});
  }

  
  getVariables() {
    return this.formModelaje.controls['fObjetivo'] as FormArray;
  }

  getRestricciones() {
    return this.formModelaje.controls['restricciones'] as FormArray;
  }

  addVariable() {
    this.getVariables().push(this.fb.control(''));
  }

  addVariableLibre(v: string) {
    if(this.variablesDisponibles.length>0){
      this.variablesLibres.push(v);
      this.variablesDisponibles = this.variablesDisponibles.filter((variable) => variable !== v);
      this.variableSeleccionada = this.variablesDisponibles[0];
    }



  }

  transformarVariable(variable:Variable){
    if(this.variablesLibres.includes(variable.id)){
      let idOriginal = variable.id; 
      variable.id = variable.id + 'p';
      const multiplicador = variable.multiplicador !== null ? variable.multiplicador : 1;
      let newVariable = new Variable((variable.id+'p'), 0, (multiplicador * -1));
      let index = this.variables.findIndex(v => v.id === variable.id);
      this.variables.splice(index+1,0,newVariable);

      this.restricciones.forEach((restriccion) => {
        restriccion.valores.forEach((variable) => {
          if(variable.id === idOriginal){
            variable.id = variable.id + 'p';
            const multiplicador = variable.multiplicador !== null ? variable.multiplicador : 1;
            let newVariable = new Variable((variable.id+'p'), 0, (multiplicador*-1));
            let index = restriccion.valores.findIndex(v => v.id === variable.id);
            restriccion.valores.splice(index+1,0,newVariable);
          }
        });
      });
    }
  }

  onSubmit() {
    this.variables.forEach((variable) => {
      if(variable.multiplicador === null){
        variable.multiplicador = 0;
      }
      this.transformarVariable(variable);
    });
    this.restricciones.forEach((restriccion) => {
      if(restriccion.operador === '<='){
        restriccion.holgura = new Variable('s'+(this.contador),1,0);
        this.contador++;
      }
      else if(restriccion.operador === '>='){
        restriccion.holgura = new Variable('s'+(this.contador),-1,0);
        this.contador++;
        restriccion.artificial = new Variable('a'+(this.contadorArtificiales),1,0);
        this.contadorArtificiales++;

      }
      else{
        restriccion.artificial = new Variable('a'+(this.contadorArtificiales),1,0);
        this.contadorArtificiales++;
      }
      restriccion.valores.forEach((variable) => {
        if(variable.multiplicador === null){
          variable.multiplicador = 0;
        }
        if(restriccion.resultado === null){
          restriccion.resultado = 0;
        }
      });
    });
    this.modelajeAprobado = true;

  }
 

  ngOnInit() {
    const nVariables = this.formInicial.get('variables')?.value;
    const nRestricciones = this.formInicial.get('restricciones')?.value;
    this.objetivo = this.formInicial.get('objetivo')?.value;
    this.metodo = this.formInicial.get('metodo')?.value;

    for(let i = 0; i < nVariables; i++){
      this.variables.push(new Variable('x' + (i+1), 0, null));
      this.variablesDisponibles.push('x' + (i+1));
      this.contador++;
    }


    for(let i = 0; i < nRestricciones; i++){
      let variablesCopia = JSON.parse(JSON.stringify(this.variables)); //Copia de las variables
        // this.restricciones.push(new Restricion(i, variablesCopia, '<=', null,new Variable('s'+(nVariables+i+1),1,0)));
        this.restricciones.push(new Restricion(i, variablesCopia, '<=', null,null,null));
    }

    if(this.variablesDisponibles.length>0){
      this.variableSeleccionada = this.variablesDisponibles[0];
    }


  }
}
