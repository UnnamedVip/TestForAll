import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GetjsondatafromfileService {

  constructor(private http:HttpClient) {}
    
  public getDataFromFile():Observable<any>{
    return this.http.get("./assets/jsonDataFiles/mydata.json");
  }
}
