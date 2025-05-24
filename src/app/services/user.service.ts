import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrentUserStateService, UserData } from '../services/current-user-state.service';

interface CambioPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private jsonUrl = 'assets/dataUsers.json';
  private users: any[] = [];
  private myuser: any[] = [];
  private baseApiUrl = 'http://localhost:8091/api/users';
  private logout = 'http://localhost:8091/logout';
  // Specific URL for the current user endpoint
  private apiUrlMe = `${this.baseApiUrl}/me`;
  private apiGetUsers = `${this.baseApiUrl}/all`;
  private apiAddUsers = `${this.baseApiUrl}/register`;
  private apiUpdateUsers = `${this.baseApiUrl}/edit/`;
  private apiDeleteUsers = `${this.baseApiUrl}/delete/`;
  private apiDetailsUsers = `${this.baseApiUrl}/details/`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<UserData[]>(this.apiGetUsers, {withCredentials: true});
  }

  cambiarPassword(userId: number, data: CambioPasswordRequest): Observable<any> {
    return this.http.put(`${this.baseApiUrl}/usuarios/${userId}/cambiar-password`, data, {withCredentials: true});
  }
  
  getLogout(): Observable<any[]> {
    return this.http.get<any[]>(this.logout, {withCredentials: true});
  }

  getMyUser(): Observable<any> {
    if (this.myuser.length > 0) {
      return new Observable((observer) => {
        observer.next(this.myuser);
        observer.complete();
      });
    } else {
      return this.http.get<UserData>(this.apiUrlMe, {withCredentials: true});
    }
  }

  addUser(newUser: any): Observable<any> {
    newUser.id = this.generateId(); 
    this.users.push(newUser);
    return of(newUser);
  }

  updateUser(editingUser: UserData): Observable<UserData> { // Use UserData type ideally
    // Validate input - ensure user object and ID exist
    if (!editingUser || typeof editingUser.id === 'undefined' || editingUser.id === null) {
        console.error('Update User Error: Invalid user data or missing ID.', editingUser);
        // Return an observable that emits an error
        return throwError(() => new Error('Invalid user data provided for update. Missing ID.'));
    }

    // Construct the specific update URL
    const updateUserUrl = `${this.apiUpdateUsers}${editingUser.id}`; // Append the ID

    console.log(`Updating user via PUT ${updateUserUrl}`);

    // Make the HTTP PUT request
    // Send the complete editingUser object as the request body
    // Expect the updated UserData object in the response
    return this.http.put<UserData>(updateUserUrl, editingUser, {
      withCredentials: true // Include Content-Type and Auth headers
    });
    // Removed the old mock logic that modified the local 'this.users' array
  }

  deleteUser(id: number): Observable<any> {
    this.users = this.users.filter((user) => user.id !== id);
    return of({ message: 'Usuario eliminado con éxito' });
  }

  private generateId(): number {
    return this.users.length > 0
      ? Math.max(...this.users.map((user) => user.id)) + 1
      : 1;
  }
}
