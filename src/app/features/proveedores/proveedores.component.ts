import { Component, OnInit } from '@angular/core';
import { SuppliersService } from '../../services/suppliers.service';
// HttpClient no se usa directamente aquí, lo usa el servicio. Puedes quitarlo si no hay otra razón.
// import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  isSidebarVisible = true;
  searchTerm: string = '';
  selectedCategory: string = 'all';
  isActive: boolean = true; // Por defecto mostrar activos
  isInactive: boolean = false;
  p: number = 1; // Para paginación ngx-pagination

  categories: any[] = []; // Para el dropdown de categorías
  proveedores: any[] = []; // Lista original de proveedores
  filteredProveedores: any[] = []; // Lista filtrada para mostrar en la tabla

  // Para el filtro combinado de campo de búsqueda y término
  campoBusquedaProveedor: string = 'all'; // 'all', 'ruc', 'name', 'contact'

  // Modelo para el formulario de agregar/editar proveedor
  // Usaremos uno para 'agregar' y otro para 'editar' para evitar conflictos
  newProveedor = {
    ruc: '',
    name: '',
    contact: '', // Email
    phone: '',
    addres: '', // Dirección
    categorySuppliers: { id: null as number | null, name: '' }, // Asegúrate que el ID pueda ser null o un número
    registration_date: '',
    state: 'Activo',
    // 'selected' ya no es necesario si las acciones son por fila
  };

  // Proveedor actualmente seleccionado para editar, ver o eliminar
  proveedorActualEnModal: any = null;

  // --- Estados de los Modales ---
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteConfirmModal: boolean = false; // Renombrado para claridad (confirmación de eliminación)
  showViewDetailsModal: boolean = false;  // Renombrado para claridad

  // Modales de Feedback
  showIncompleteFieldsModal: boolean = false;
  showSuccessModal: boolean = false;
  successModalMessage: string = ''; // Mensaje dinámico para el modal de éxito
  showErrorModal: boolean = false;
  errorModalMessage: string = ''; // Mensaje dinámico para el modal de error

  // Modales "En Proceso" (opcional, pero útil para UX)
  isAddingInProgress: boolean = false;
  isEditingInProgress: boolean = false;
  isDeletingInProgress: boolean = false;


  constructor(private suppliersService: SuppliersService) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadCategories(); // Cargar categorías primero o en paralelo
    this.loadProveedores(); // Luego proveedores, que podría usar categorías si se filtran en el backend
  }

  loadProveedores(): void {
    this.suppliersService.getSuppliers().subscribe(
      (data) => {
        this.proveedores = data.map(p => ({ ...p, selected: false })); // Inicializar 'selected' si aún lo usas para algo
        this.applyFilters(); // Aplicar filtros una vez cargados los datos
      },
      (error) => {
        console.error('Error al cargar proveedores:', error);
        this.showFeedbackModal('error', 'Error al cargar proveedores.');
      }
    );
  }

  loadCategories(): void {
    this.suppliersService.getCategories().subscribe(
      (data) => {
        this.categories = data;
        // Si necesitas extraer categorías únicas de los proveedores cargados (como antes):
        // this.extractUniqueCategoriesFromProveedores();
      },
      (error) => {
        console.error('Error al cargar las categorías:', error);
        // Podrías mostrar un error aquí también si es crítico
      }
    );
  }

  // Si las categorías vienen de un endpoint dedicado, este método no es necesario.
  // Si necesitas derivarlas de los proveedores:
  /*
  extractUniqueCategoriesFromProveedores(): void {
    if (this.proveedores.length > 0) {
      this.categories = Array.from(
        new Map(
          this.proveedores
            .filter((proveedor) => proveedor.categorySuppliers && proveedor.categorySuppliers.id)
            .map((proveedor) => [
              proveedor.categorySuppliers.id,
              proveedor.categorySuppliers,
            ])
        ).values()
      );
    }
  }
  */

  applyFilters(): void {
    let tempProveedores = [...this.proveedores];

    // Filtro por campo de búsqueda
    if (this.searchTerm.trim() !== '') {
      const searchTermLower = this.searchTerm.toLowerCase();
      tempProveedores = tempProveedores.filter(proveedor => {
        if (this.campoBusquedaProveedor === 'ruc') {
          return proveedor.ruc?.toLowerCase().includes(searchTermLower);
        } else if (this.campoBusquedaProveedor === 'name') {
          return proveedor.name?.toLowerCase().includes(searchTermLower);
        } else if (this.campoBusquedaProveedor === 'contact') {
          return proveedor.contact?.toLowerCase().includes(searchTermLower);
        } else { // 'all'
          return (
            proveedor.ruc?.toLowerCase().includes(searchTermLower) ||
            proveedor.name?.toLowerCase().includes(searchTermLower) ||
            proveedor.contact?.toLowerCase().includes(searchTermLower)
          );
        }
      });
    }

    // Filtro por categoría
    if (this.selectedCategory === 'uncategorized') {
      tempProveedores = tempProveedores.filter(proveedor =>
        !proveedor.categorySuppliers || !proveedor.categorySuppliers.name
      );
    } else if (this.selectedCategory !== 'all') {
      tempProveedores = tempProveedores.filter(proveedor =>
        proveedor.categorySuppliers?.name === this.selectedCategory
      );
    }
    // Si es 'all', no filtramos nada.

    // Filtro por estado
    if (this.isActive && !this.isInactive) {
      tempProveedores = tempProveedores.filter(proveedor => proveedor.state === 'Activo');
    } else if (!this.isActive && this.isInactive) {
      tempProveedores = tempProveedores.filter(proveedor => proveedor.state === 'Inactivo');
    } else if (!this.isActive && !this.isInactive) {
      tempProveedores = [];
    }
    // Si ambos están true, no se filtra por estado.

    this.filteredProveedores = tempProveedores;
    this.p = 1;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // --- Lógica de Validación ---
  validateProveedorData(proveedorData: any): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Regex más genérica

    if (!proveedorData.ruc || !/^\d{11}$/.test(proveedorData.ruc)) {
      errors.push('RUC debe ser numérico y de 11 dígitos.');
    }
    if (!proveedorData.name?.trim()) {
      errors.push('El nombre del proveedor es requerido.');
    }
    if (!proveedorData.contact?.trim() || !emailRegex.test(proveedorData.contact)) {
      errors.push('Email inválido o vacío.');
    }
    if (!proveedorData.phone || !/^\d{9}$/.test(proveedorData.phone)) {
      errors.push('Teléfono debe ser numérico y de 9 dígitos.');
    }
    if (!proveedorData.addres?.trim()) {
      errors.push('La dirección es requerida.');
    }
    if (!proveedorData.categorySuppliers?.id) {
      errors.push('Debe seleccionar una categoría.');
    }
    if (!proveedorData.registration_date) {
      errors.push('La fecha de registro es requerida.');
    }
    // 'state' usualmente tiene un valor por defecto.

    return { isValid: errors.length === 0, errors };
  }

  isEmailValid(email: string): boolean { // La mantienes si la usas en el template directamente
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) { // Permite teclas de control como backspace
      event.preventDefault();
    }
  }

  resetNewProveedorForm(): void {
    this.newProveedor = {
      ruc: '',
      name: '',
      contact: '',
      phone: '',
      addres: '',
      categorySuppliers: { id: null, name: '' },
      registration_date: '',
      state: 'Activo',
    };
  }

  // --- Manejo de Modales ---
  openAddModal(): void {
    this.resetNewProveedorForm(); // Resetea el formulario antes de abrir
    // this.loadCategories(); // Asegúrate que las categorías estén cargadas
    this.showAddModal = true;
  }

  // Estos métodos ahora reciben el proveedor de la fila
  openEditModal(proveedor: any): void {
    // Clona el proveedor para evitar modificar el original en la lista directamente
    // y formatea la fecha para el input type="date"
    this.proveedorActualEnModal = {
      ...proveedor,
      registration_date: proveedor.registration_date ? new Date(proveedor.registration_date).toISOString().split('T')[0] : ''
    };
    if (proveedor.categorySuppliers && proveedor.categorySuppliers.id) {
      this.proveedorActualEnModal.categorySuppliers = { id: proveedor.categorySuppliers.id };
    } else {
      this.proveedorActualEnModal.categorySuppliers = { id: null }; // o un valor por defecto
    }
    this.showEditModal = true;
  }

  openDeleteModal(proveedor: any): void {
    this.proveedorActualEnModal = proveedor; // Guardas la referencia al proveedor a eliminar
    this.showDeleteConfirmModal = true;
  }

  openViewModal(proveedor: any): void {
    this.proveedorActualEnModal = proveedor;
    this.showViewDetailsModal = true;
  }

  closeAllModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteConfirmModal = false;
    this.showViewDetailsModal = false;
    this.showIncompleteFieldsModal = false; // También cierra este si está abierto
    // No cierres success/error aquí, se manejan con timeout o acción del usuario
  }

  showFeedbackModal(type: 'success' | 'error', message: string, duration: number = 3000): void {
    if (type === 'success') {
      this.successModalMessage = message;
      this.showSuccessModal = true;
      setTimeout(() => this.showSuccessModal = false, duration);
    } else {
      this.errorModalMessage = message;
      this.showErrorModal = true;
      setTimeout(() => this.showErrorModal = false, duration);
    }
  }


  // --- Acciones CRUD ---
  addProveedorSubmit(): void { // Renombrado de addProveedor para el submit del form
    const validation = this.validateProveedorData(this.newProveedor);
    if (!validation.isValid) {
      this.errorModalMessage = 'Campos incompletos o inválidos: ' + validation.errors.join(', ');
      this.showErrorModal = true;
      setTimeout(() => this.showErrorModal = false, 4000); // Mostrar por más tiempo
      return;
    }

    this.isAddingInProgress = true;
    // Asegurar que la fecha se envíe en el formato correcto si el backend lo espera (ej. ISOString)
    // Si el input type="date" ya da 'YYYY-MM-DD', y el backend lo acepta, está bien.
    // Si el backend espera un timestamp o un objeto Date, ajústalo aquí.
    const payload = {
      ...this.newProveedor,
      // registration_date: new Date(this.newProveedor.registration_date).toISOString(), // Si necesitas ISO
      categorySuppliers: { id: Number(this.newProveedor.categorySuppliers.id) } // Asegurar que el ID sea número
    };
    // delete payload.selected; // Si la propiedad 'selected' existe y no debe ir al backend
    this.suppliersService.addSupplier(payload).subscribe(
      (response) => {
        this.isAddingInProgress = false;
        this.showFeedbackModal('success', 'Proveedor agregado exitosamente.');
        Swal.fire({
        title: 'Proveedor registrado',
        text: 'El proveedor se ha registrado con éxito.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
        });
        this.loadProveedores(); // Recargar la lista
        this.closeAllModals();
      },
      (error) => {
        this.isAddingInProgress = false;
        console.error('Error al agregar proveedor:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el proveedor. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  editProveedorSubmit(): void { // Renombrado de editProveedor para el submit del form
    if (!this.proveedorActualEnModal) return;

    const validation = this.validateProveedorData(this.proveedorActualEnModal);
    if (!validation.isValid) {
      this.errorModalMessage = 'Campos incompletos o inválidos: ' + validation.errors.join(', ');
      this.showErrorModal = true;
      setTimeout(() => this.showErrorModal = false, 4000);
      return;
    }

    const proveedorId = this.proveedorActualEnModal.id;
    const payload = {
      ...this.proveedorActualEnModal,
      // registration_date: new Date(this.proveedorActualEnModal.registration_date).toISOString(), // Si necesitas ISO
      categorySuppliers: { id: Number(this.proveedorActualEnModal.categorySuppliers.id) }
    };
    // delete payload.selected; // Si existe

    this.suppliersService.editSupplier(proveedorId, payload).subscribe(
      (response) => {
        Swal.fire({
        title: 'Proveedor actualizado',
        text: 'El proveedor se ha actualizado con éxito.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
        });
        this.loadProveedores();
        this.closeAllModals();
      },
      (error) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el proveedor. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        const errMsg = error.error?.message || error.message || 'Error desconocido al editar proveedor.';
        this.showFeedbackModal('error', `Error: ${errMsg}`);
      }
    );
  }

  confirmDeleteProveedor(): void { // Renombrado de deleteProveedor
    if (this.proveedorActualEnModal && this.proveedorActualEnModal.id) {
      const proveedorId = this.proveedorActualEnModal.id;
      this.isDeletingInProgress = true;

      this.suppliersService.deleteSupplier(proveedorId).subscribe(
        () => {
          this.isDeletingInProgress = false;
          this.showFeedbackModal('success', 'Proveedor eliminado exitosamente.');
          this.loadProveedores(); // Recargar para reflejar la eliminación
          this.closeAllModals();
        },
        (error) => {
          this.isDeletingInProgress = false;
          console.error('Error al eliminar proveedor:', error);
          const errMsg = error.error?.message || error.message || 'Error desconocido al eliminar proveedor.';
          this.showFeedbackModal('error', `Error: ${errMsg}`);
          // No cierres el modal de confirmación de borrado aquí, el usuario podría querer reintentar o cancelar.
          // O ciérralo si la política es que se cierre tras un error: this.closeAllModals();
        }
      );
    }
  }

  openConfirmDeleteModal(proveedor: any): void { // Recibe el objeto completo para mostrar el nombre
    Swal.fire({
      title: '¿Estás seguro?',
      text: `No podrás recuperar al proveedor "${proveedor.name}" después de eliminarlo.`, // Mensaje dinámico
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true, // Pone el botón de confirmar a la derecha
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, llamamos al método que ejecuta la eliminación
        this.deleteProveedor(proveedor.id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Opcional: Mostrar un mensaje si el usuario cancela
        Swal.fire(
          'Cancelado',
          'El proveedor no ha sido eliminado.',
          'info'
        );
      }
    });
  }

  // **NUEVO MÉTODO PARA EJECUTAR LA ELIMINACIÓN**
  // Este método es privado o llamado solo por el de confirmación.
  private deleteProveedor(proveedorId: number): void {
    Swal.fire({
      title: 'Eliminando...',
      text: 'Por favor, espera mientras se elimina el proveedor.',
      allowOutsideClick: false,
      showConfirmButton: false, // Oculta el botón OK mientras carga
      willOpen: () => {
        Swal.showLoading(); // Muestra el spinner
      }
    });

    this.suppliersService.deleteSupplier(proveedorId).subscribe({
      next: (response) => {
        // Actualizamos la lista localmente para una respuesta visual instantánea
        // SIN necesidad de llamar a this.loadProveedores() de nuevo.
        this.proveedores = this.proveedores.filter(p => p.id !== proveedorId);
        this.applyFilters(); // Re-aplicamos los filtros sobre la nueva lista

        Swal.fire(
          '¡Eliminado!',
          'El proveedor ha sido eliminado correctamente.',
          'success'
        );
      },
      error: (error) => {
        const errMsg = error.error?.message || 'No se pudo eliminar el proveedor.';
        Swal.fire(
          'Error',
          errMsg,
          'error'
        );
        console.error('Error al eliminar proveedor:', error);
      }
    });
  }

  // --- Toggle Sidebar ---
  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  // --- Helpers para el template (si aún los necesitas después de mover acciones a filas) ---
  // Si las acciones están por fila, estos ya no son necesarios:
  // hasSelectedProveedor(): boolean {
  //   return !!this.proveedores.find(p => p.selected);
  // }
  // getSingleSelectedProveedor(): any {
  //   return this.proveedores.find(p => p.selected);
  // }
  // toggleAll(event: any): void {
  //   const isChecked = event.target.checked;
  //   this.filteredProveedores.forEach(proveedor => proveedor.selected = isChecked);
  //   // También actualiza la lista original si es necesario o si filteredProveedores es una copia profunda.
  // }
  // selectProveedor(proveedor: any): void {
  //   // Lógica para manejar selección individual si es diferente a solo marcar 'selected'
  //   // Por ejemplo, para asegurar que solo uno esté seleccionado para 'editar'
  //   if (proveedor.selected) {
  //     this.proveedores.forEach(p => {
  //       if (p !== proveedor) p.selected = false;
  //     });
  //   }
  // }
}