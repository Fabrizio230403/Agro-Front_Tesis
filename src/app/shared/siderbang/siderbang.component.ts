import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnInit, OnDestroy
import { Router } from '@angular/router';
import { Subscription } from 'rxjs'; // Import Subscription
import { AuthService } from '../../services/auth.service';
// Remove UserService import if not directly needed here
import { UserService } from '../../services/user.service';
// Import the state service and UserData interface
import { CurrentUserStateService, UserData } from '../../services/current-user-state.service';

@Component({
  selector: 'app-siderbang',
  templateUrl: './siderbang.component.html',
  styleUrls: ['./siderbang.component.css']
})
// Implement OnInit and OnDestroy
export class SiderbangComponent implements OnInit, OnDestroy {
  // activeLink can be handled better with routerLinkActive directive in template
  // activeLink: string;

  id: number | null = null;
  username: string | null = null; // Initialize to null
  rol: string | null = null;      // Initialize to null
  created_at: string | null = null;
  enabled: boolean | null = null;
  telefono: string | null = null;
  permissions: string[] = [];
  modules: string[] = [];
  userProfileImageUrl: string = '../../../assets/images/perfilFoto.png';
  // Loading flag is not needed when using the reactive approach
  // loading: boolean = false;

  // Property to hold the subscription
  private userSubscription: Subscription | null = null;

  constructor(
      private router: Router,
      private authService: AuthService,
      private currentUserStateService: CurrentUserStateService, // Inject state service
      // Remove userService if not used directly
      private userService: UserService,
      ) {
    // Setting activeLink here is unreliable; use routerLinkActive in template
    // this.activeLink = this.router.url;
  }

  ngOnInit(): void {
    console.log('SiderbangComponent: Subscribing to user state changes...');
    // *** Subscribe to the observable stream ***
    this.userSubscription = this.currentUserStateService.currentUser$.subscribe(
      (currentUser: UserData | null) => {
        // This code runs IMMEDIATELY with the current value AND
        // runs AGAIN whenever setUser() or clearUser() is called.
        console.log('SiderbangComponent: Received user state update:', currentUser);
        if (currentUser) {
          // User is logged in
          // *** Use correct property names from UserData interface ***
          this.id = currentUser.id ?? 0; // Assuming interface uses 'role'
          this.username = currentUser.username ?? 'N/A';
          this.rol = currentUser.rol?.roleName ?? 'No asignado'; // Assuming interface uses 'role'
          this.created_at = currentUser.created_at ?? 'N/A'; // Assuming interface uses 'role'
          this.enabled = currentUser.enabled ?? 0; // Assuming interface uses 'role'
          this.telefono = currentUser.telefono ?? 'N/A'; // Assuming interface uses 'role'
          const permissions = currentUser.rol?.permissions ?? [];

          const permissionNames = permissions.map(p => p.permissionName);
          this.permissions = [...new Set(permissionNames)];

          const moduleNames = permissions.map(permission => permission?.module?.moduleName);

          const validModuleNames = moduleNames.filter(Boolean) as string[];

          this.modules = [...new Set(validModuleNames)];
          //this.modules = currentUser.rol?.permissions?.module?.moduleName;
          // Optionally set profile image:
          // this.userProfileImageUrl = currentUser.profileImageUrl ?? '../../../assets/images/perfilFoto.png';
        } else {
          // User is logged out or state is cleared
          this.id = 0;
          this.username = null; // Clear display properties
          this.rol = null;
          this.created_at = null;
          this.enabled = null;
          this.telefono = null;
          this.modules = [];
          this.permissions = [];
          this.userProfileImageUrl = '../../../assets/images/perfilFoto.png'; // Reset image
        }
      }
    );
    // *** Remove the call to loadUsers() ***
    // this.loadUsers();
  }

  // *** Add ngOnDestroy to unsubscribe ***
  ngOnDestroy(): void {
    console.log('SiderbangComponent: Unsubscribing from user state changes.');
    this.userSubscription?.unsubscribe(); // Unsubscribe to prevent memory leaks
  }

  // Remove the loadUsers method - it's replaced by the subscription logic
  // loadUsers(): void { ... }

  // Keep isActive if you are not using routerLinkActive in the template
  isActive(link: string): boolean {
    // Using router.isActive is generally more reliable than comparing router.url
    return this.router.isActive(link, {
        paths: 'exact',
        queryParams: 'exact',
        fragment: 'ignored',
        matrixParams: 'ignored'
      });
  }

  logout() {
    this.authService.logout(); // AuthService should clear state and navigate
    // No need to navigate here if AuthService handles it
    this.userService.getLogout();
    this.currentUserStateService.clearUser();
     this.router.navigate(['/login']);
  }
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
  module: ModuleData; // Represents the nested Modules object
  assigned?: boolean;  // <-- esta propiedad extra que marca si está asignado


  // --- ALTERNATIVE ---
  // If your API only sends the module_id instead of the full module object,
  // you would use this instead of the 'module' property above:
  // moduleId?: number;
}