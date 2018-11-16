import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirstComponent } from './first/first.component';
import { SecondComponent } from './second/second.component';
import { ThirdComponent } from './third/third.component';
import { TestformsComponent } from './testforms/testforms.component';
import { CounterComponent } from './shared/counter/counter.component';
import { GetjsondatafromfileService } from './services/getjsondatafromfile.service';
import { HttpClientModule } from '@angular/common/http';
import {AgGridModule} from "ag-grid-angular/main";
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    FirstComponent,
    SecondComponent,
    ThirdComponent,
    TestformsComponent,
    CounterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AgGridModule.withComponents([])
  ],
  providers: [GetjsondatafromfileService,
    DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
