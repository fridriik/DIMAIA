import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

 // private endpoint : string ='/imagen';
 // private api : string ='https://api-resultados.onrender.com/Pruebas';
  private apiDiagnostic : string ='https://api-resultados.onrender.com/Diagnosticos/';

  constructor(private http: HttpClient) { }


  public getResultado(id:String):Observable<any>{
    let url=this.apiDiagnostic + 'historial' + '/' + id;
    return this.http.get<any>(url);
  }
  public postResultado(data:FormData):Observable<any>{
    let url=this.apiDiagnostic+'predecir/cerebro';
    return this.http.post<any>(url,data);
  }
}
