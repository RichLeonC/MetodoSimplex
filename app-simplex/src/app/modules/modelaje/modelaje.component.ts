import { Component,Input,OnInit,NgModule } from '@angular/core';
import { FormBuilder,Validators,FormGroup,ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modelaje',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modelaje.component.html',
  styleUrl: './modelaje.component.scss'
})


export class ModelajeComponent implements OnInit{
  @Input() formInicial!: FormGroup;
  formModelaje: FormGroup;
  constructor(private fb: FormBuilder) {
    this.formModelaje = this.fb.group({});
  }

  

 

  ngOnInit() {
    const variables = this.formInicial.get('variables')?.value;
    const restricciones = this.formInicial.get('restricciones')?.value;
    const objetivo = this.formInicial.get('objetivo')?.value;

    const fObjetivoCampos = Array(variables).fill(0).map(() => this.fb.control(''));
    const nRestricciones = Array(restricciones).fill(0).map(() => this.fb.control(''));
    this.formModelaje = this.fb.group({
      fObjetivo: this.fb.array(fObjetivoCampos),
      restricciones: this.fb.array(nRestricciones),
      objetivo: this.fb.control(objetivo)

    });

    console.log(this.formModelaje.value);

  }
}
