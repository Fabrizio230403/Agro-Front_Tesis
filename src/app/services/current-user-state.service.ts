import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // Import Inject, PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

export interface UserData {
  id: number;
  username: string;
  email: string;
  created_at: string;
  enabled: boolean;
  telefono: string;
  rol: RoleData;
}

export interface RoleData {
  id: number;
  roleName?: string;
  description?: string; // Optional based on if it's always present
  permissions?: PermissionData[]; // Use a more specific type if you know what's in permissions (e.g., string[])
}

export interface ModuleData {
  id: number;
  // Add other relevant fields from your Modules entity if they are included
  // in the JSON response, e.g.:
  moduleName?: string;
  permissions?: PermissionData[];  // permisos incluidos en el módulo

  // description?: string;
}

// TypeScript interface corresponding to the Java Permission entity
export interface PermissionData {
  id: number;
  permissionName: string;
  description?: string | null; // Optional or nullable, as it's not marked 'nullable = false'
  module?: ModuleData; // Represents the nested Modules object
  assigned?: boolean;  // <-- esta propiedad extra que marca si está asignado


  // --- ALTERNATIVE ---
  // If your API only sends the module_id instead of the full module object,
  // you would use this instead of the 'module' property above:
  // moduleId?: number;
}

interface ModulesResponse {
  modules: ModuleData[];
  roleId: number;
}

const USER_STATE_STORAGE_KEY = 'currentUserData';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserStateService {
  private baseApiUrlRoles = 'http://localhost:8091/api/roles';
  private apiGetRoles = `${this.baseApiUrlRoles}`;

  private jsonUrl = 'assets/myUser.json'; // Still only relevant for READING
  private isBrowser: boolean; // Flag to store platform check result

  private userStateSubject = new BehaviorSubject<UserData | null>(null);
  public readonly currentUser$: Observable<UserData | null> = this.userStateSubject.asObservable();

  // Inject PLATFORM_ID
  constructor(@Inject(PLATFORM_ID) private platformId: object, private http: HttpClient) {
    // Determine if we are in the browser environment
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log(`CurrentUserStateService initialized. Is Browser? ${this.isBrowser}`);

    // Load initial state ONLY if in the browser
    if (this.isBrowser) {
      this.loadStateFromStorage();
    }
  }

  getRoles(): Observable<any[]> {
    return this.http.get<RoleData[]>(this.apiGetRoles, { withCredentials: true });
  }

  getModulesWithPermissionsByRole(roleId: number): Observable<ModulesResponse> {
    return this.http.get<ModulesResponse>(`${this.baseApiUrlRoles}/${roleId}/modules-permissions`, {
      withCredentials: true
    });
  }

  /**
   * [SET User State]
   * Updates the live state AND saves to sessionStorage IF IN BROWSER.
   */
  setUser(user: UserData | null): void {
    console.log('CurrentUserStateService: Setting user state:', user);
    this.userStateSubject.next(user); // 1. Update the live state (always happens)

    // --- 2. Persist to sessionStorage (ONLY IN BROWSER) ---
    if (this.isBrowser) { // <-- PLATFORM CHECK
      if (user) {
        try {
          sessionStorage.setItem(USER_STATE_STORAGE_KEY, JSON.stringify(user));
          console.log('CurrentUserStateService: User state saved to sessionStorage.');
        } catch (e) {
          console.error('CurrentUserStateService: Error saving user state to sessionStorage', e);
        }
      } else {
        try {
          sessionStorage.removeItem(USER_STATE_STORAGE_KEY);
          console.log('CurrentUserStateService: User state removed from sessionStorage.');
        } catch (e) {
          console.error('CurrentUserStateService: Error removing user state from sessionStorage', e);
        }
      }
    } else {
      console.log('CurrentUserStateService: Skipping sessionStorage write (not in browser).');
    }
    // --- End of Persistence ---
  }

  /**
   * [GET User State (Snapshot)]
   * Gets the current live value from the service's BehaviorSubject.
   * This doesn't directly access sessionStorage, so it's safe on server.
   */
  getUser(): UserData | null {
    // console.log('CurrentUserStateService: Getting user snapshot from live state.');
    // getValue() is safe to call on server/browser as it reads in-memory state
    return this.userStateSubject.getValue();
  }

  /**
   * [CLEAR User State]
   * Clears the live state AND removes from sessionStorage IF IN BROWSER.
   */
  clearUser(): void {
    console.log('CurrentUserStateService: Clearing user state.');
    // Calling setUser(null) handles both the subject and the browser check for storage
    this.setUser(null);
  }

  /**
   * [CHECK Login Status]
   */
  isLoggedIn(): boolean {
    // Uses getUser which reads the BehaviorSubject, safe on server/browser
    return !!this.getUser();
  }

  /**
   * [LOAD State on Init] - *** Runs only if in the browser ***
   * Loads user data from sessionStorage into the BehaviorSubject.
   */
  private loadStateFromStorage(): void {
    // Double check, although constructor already checks
    if (!this.isBrowser) {
      console.log('CurrentUserStateService: Skipping loadStateFromStorage (not in browser).');
      return;
    }

    console.log('CurrentUserStateService: Attempting to load state from sessionStorage.');
    const storedData = sessionStorage.getItem(USER_STATE_STORAGE_KEY);
    if (storedData) {
      try {
        const user = JSON.parse(storedData) as UserData;
        this.userStateSubject.next(user); // Initialize live state
        console.log('CurrentUserStateService: Loaded initial user state from sessionStorage:', user);
      } catch (e) {
        console.error('CurrentUserStateService: Error parsing stored user data from sessionStorage', e);
        try {
          sessionStorage.removeItem(USER_STATE_STORAGE_KEY); // Clean up bad data
        } catch (removeError) {
          console.error('CurrentUserStateService: Error removing corrupted data from sessionStorage', removeError);
        }
      }
    } else {
      console.log('CurrentUserStateService: No user state found in sessionStorage.');
    }
  }
}