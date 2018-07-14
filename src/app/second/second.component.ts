import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-second',
  templateUrl: './second.component.html',
  styleUrls: ['./second.component.css']
})
export class SecondComponent implements OnInit {

  private card: FormGroup;

  constructor(private formBuilder: FormBuilder) {

    this.card = this.formBuilder.group({
      companyName: ['', Validators.required]
    });

    this.card.valueChanges.subscribe(dataAll => {
      this.checkcard(dataAll)
    }, () => console.log('complete'));
  }

  ngOnInit() {
  }

  getSum(a: number, b: number) {
    return a + b;
  }

  checkNameCompany:boolean=false;

  checkcard(data) {
    //let regVar =  /^[А-Я]{1}[а-я]{1,14}( [|А-Яа-я]{1})?([а-я]{0,14})?( [А-Яа-я]{1})?([а-я]{1,14})?$/;
    let regVar = /(^([A-Z]{1}[a-z]+(\s[A-Z]{1}[a-z]+$|$)))|(^([А-я]{1}[а-я]+(\s[А-я]{1}[а-я]+$|$)))/;

    if (regVar.test(data.companyName)) {
      this.checkNameCompany = true;
      console.log(true);
    }
    else {
      this.checkNameCompany = false;
      console.log(false);
    }
  }

}
