import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-second',
  templateUrl: './second.component.html',
  styleUrls: ['./second.component.css']
})
export class SecondComponent implements OnInit {

  constructor() {
    //console.log('second', 'Constructor Run');
  }

  ngOnInit() {
    //console.log('second', 'ngOnInit Run');
  }

  getSum(a:number, b:number){
    return a + b;
  }

}
