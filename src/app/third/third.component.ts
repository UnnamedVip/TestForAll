import { Component, OnInit } from '@angular/core';
import { Observable, of } from '../../../node_modules/rxjs';

@Component({
  selector: 'app-third',
  templateUrl: './third.component.html',
  styleUrls: ['./third.component.css']
})
export class ThirdComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.observableFunction();
    this.promiseFunction();
  }

  //#region for Observable
  observablePush: any = [];
  observableShow: any = [];
  observableMessage: string;


  observableFunction() {
    this.getArrForObsPush().subscribe(data => { this.observableShow = data; });
  }

  setNewValue(val: string) {
    this.observablePush.push(val);
    this.observableMessage = '';
  }

  clearAr() {
    this.observablePush = [];
    this.observableFunction();
  }

  getArrForObsPush(): Observable<any[]> {
    return Observable.create(observer => {
      observer.next(this.observablePush);
    }
    );
  }

  //#endregion for Observeble

  //#region for Promise
  promisePush: any = [];
  promiseShow: any = [];
  promiseMessage: string;


  promiseFunction() {
    this.getArrPromForPush().then(data => {
      this.promiseShow = data;
    });
  }

  setNewPromValue(val: string) {
    this.promisePush.push(val);
    this.promiseMessage = '';
  }

  clearPromAr() {
    this.promisePush = [];
    this.promiseFunction();
  }

  getArrPromForPush() {
      let promise = new Promise((resolve) => {
        resolve(this.promisePush);
      });
      return promise;
  }

  //#endregion for Promise

}
