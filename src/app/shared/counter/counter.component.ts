import { Component, OnInit, forwardRef, HostListener } from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CounterComponent),
    multi: true
  }]
})
export class CounterComponent implements OnInit, ControlValueAccessor   {

  constructor() { }

  ngOnInit() {
  }

  // вызовем когда значение изменится
  onChange: Function;

  // вызовем при любом дествии пользователя с контроллом
  onTouched: Function;
  
  private _value: number = 0;

  get value() {
    return this._value;
  }

  // устанавливаем новое значение и сообщаем об этом форме
  set value(value: number) {
    this._value = value;
    if (this.onChange) {
      this.onChange(value);
    }
  }
  
  // реакция на клик хост-элемента, говорим форме что контрол "потрогали"
  /* @HostListener('click') click() {
    if (this.onTouched) {
      this.onTouched();
      console.log("your click me");
    }
  } */
  
  // увеличиваем значение
  increment() {
    this.value++;
  }

  // уменьшаем значение
  decrement() {
    this.value--;
  }
  
  // вызовет форма если значение изменилось извне
  writeValue(obj: any): void {
    this.value = obj;
  }

  // сохраняем обратный вызов для изменений
  registerOnChange(fn: any): void {
    this.onChange = fn; 
    
  }
  
  // сохраняем обратный вызов для "касаний"
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
