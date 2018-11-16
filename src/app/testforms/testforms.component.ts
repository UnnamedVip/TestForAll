import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-testforms',
  templateUrl: './testforms.component.html',
  styleUrls: ['./testforms.component.css']

})
export class TestformsComponent implements OnInit {

  form: FormGroup;

  ngModelCount: number = 0;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      count: 0
    });

    this.form.valueChanges.subscribe(data =>{      
      console.log(data);
    });
  }

  ngOnInit() { }

  plus2(){
    this.form.setValue({count:this.form.get('count').value + 5},{emitEvent:false});
  }

}
