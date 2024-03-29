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

  onSubmit() {
    this.variables.forEach((variable) => {
      if(variable.multiplicador === null){
        variable.multiplicador = 0;
      }
    });
    this.restricciones.forEach((restriccion) => {
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
    // console.log(this.variables);
    // console.log(this.restricciones);
  }
 

  ngOnInit() {
    const nVariables = this.formInicial.get('variables')?.value;
    const nRestricciones = this.formInicial.get('restricciones')?.value;
    this.objetivo = this.formInicial.get('objetivo')?.value;

    for(let i = 0; i < nVariables; i++){
      this.variables.push(new Variable('x' + (i+1), 0, null));
    }


    for(let i = 0; i < nRestricciones; i++){
      let variablesCopia = JSON.parse(JSON.stringify(this.variables)); //Copia de las variables
      this.restricciones.push(new Restricion(i, variablesCopia, '<=', null,new Variable('s'+(nVariables+i+1),1,0)));
    }


  }
}
