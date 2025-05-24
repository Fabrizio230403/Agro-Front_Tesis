import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private suppliers: any[] = []; 
  private apiUrl = 'http://localhost:8091/api/suppliers';
  private categoriesUrl = 'http://localhost:8091/api/CatSuppliers'; 

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<any[]> {
    if (this.suppliers.length > 0) {
      
      return new Observable((observer) => {
        observer.next(this.suppliers);
        observer.complete();
      });
    } else {
      
      return this.http.get<any[]>(this.apiUrl, {withCredentials: true});
    }
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.categoriesUrl, {withCredentials: true});
  }

  setSuppliers(suppliers: any[]): void {
    this.suppliers = suppliers;
  }

  addSupplier(supplier: any): Observable<any> {
    const apiUrladd = 'http://localhost:8091/api/suppliers/register';
    return this.http.post<any>(apiUrladd, supplier, {withCredentials: true}).pipe(
      catchError((error) => {
        console.error('Error al agregar proveedor:', error);
        throw error; // Lanza el error para que el componente lo maneje
      })
    );
}

  editSupplier(id: number, supplier: any): Observable<any> {
    const apiUrlEdit = `http://localhost:8091/api/suppliers/edit/${id}`;
    return this.http.put<any>(apiUrlEdit, supplier, {withCredentials: true}).pipe(
      catchError((error) => {
        console.error('Error al editar proveedor:', error);
        throw error; 
      })
    );
  }

  deleteSupplier(id: number): Observable<any> {
    const apiUrlDelete = `http://localhost:8091/api/suppliers/delete/${id}`;
    return this.http.delete<any>(apiUrlDelete, {withCredentials: true}).pipe(
      catchError((error) => {
        console.error('Error al eliminar proveedor:', error);
        throw error; // Esto permite manejar el error en el componente
      })
    );
  }
}
