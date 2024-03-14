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
  constructor(private fb: FormBuilder) {}

  form = this.fb.group({
    objetivo: ['', Validators.required],
    variables: ['', Validators.required],
    restricciones: ['', Validators.required]
  });

  isSubmitted:boolean = false;


  onSubmit() {
    if(this.form.valid){
      console.log(this.form.value);
      this.isSubmitted = true;
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
