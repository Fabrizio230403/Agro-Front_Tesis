 export interface Permission {
    permission_name: string;
  }
  
  export interface Module {
    module_name: string;
    permissions: Permission[];
  }
  
  export interface Role {
    role_id: number;
    role_name: string;
    modules: {
      expanded: any;
      module_name: string;
      permissions: {
      isGranted: any;
      isSelected: any; permission_name: string 
      }[];
    }[];
    description: string;
    isExpanded?: boolean;

    isOpen?: boolean;
    //modules: Module[]; // Propiedad opcional para controlar el colapso en el modal
  }
  