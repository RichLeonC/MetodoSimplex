import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormBuilder,Validators,FormGroup,ReactiveFormsModule } from '@angular/forms';
import { ModelajeComponent } from './modules/modelaje/modelaje.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,ReactiveFormsModule,ModelajeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  key = 0;
  constructor(private fb: FormBuilder) {}

  form = this.fb.group({
    metodo: ['', Validators.required],
    objetivo: ['', Validators.required],
    variables: ['', Validators.required],
    restricciones: ['', Validators.required]
  });

  isSubmitted:boolean = false;


  onSubmit() {
    if(this.form.valid){
      this.isSubmitted = true;
      this.key++;
    }
    else{
      
      Object.values(this.form.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
  

  ngOnInit() {

  }
 
}
