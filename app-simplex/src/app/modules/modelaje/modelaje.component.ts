import { Component,Input,OnInit,NgModule } from '@angular/core';
import { FormBuilder,Validators,FormGroup,ReactiveFormsModule, FormArray,FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { get } from 'http';
import { Variable } from '../../modelos/variable.model';
import { Restricion } from '../../modelos/restriccion.model';

@Component({
  selector: 'app-modelaje',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './modelaje.component.html',
  styleUrl: './modelaje.component.scss'
})


export class ModelajeComponent implements OnInit{
  @Input() formInicial!: FormGroup;
  formModelaje: FormGroup;
  variables: Array<Variable> = [];
  restricciones: Array<Restricion> = [];
  objetivo: string = '';

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
 

  ngOnInit() {
    const nVariables = this.formInicial.get('variables')?.value;
    const nRestricciones = this.formInicial.get('restricciones')?.value;
    this.objetivo = this.formInicial.get('objetivo')?.value;

    for(let i = 0; i < nVariables; i++){
      this.variables.push(new Variable('x' + i, 0, 0));
    }

    for(let i = 0; i < nRestricciones; i++){
      this.restricciones.push(new Restricion(i, this.variables, '>=', 0));
    }



    // const fObjetivoCampos = Array(variables).fill(0).map(() => this.fb.control(''));
    // const nnRestricciones = Array(restricciones).fill(0).map(() => this.fb.control(''));
    // this.formModelaje = this.fb.group({
    //   fObjetivo: this.fb.array(fObjetivoCampos),
    //   restricciones: this.fb.array(nRestricciones),
    //   objetivo: this.fb.control(objetivo)

    // });



    console.log(this.variables[0].id);
    console.log(this.restricciones);

  }
}
