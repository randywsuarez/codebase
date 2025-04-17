# Documentación de Componentes Vue

Este archivo contiene documentación sobre los componentes reutilizables creados para este proyecto.

## DataTable (`src/components/DataTable.vue`)

Componente genérico para mostrar datos en una tabla usando Quasar (`q-table`).

### Propósito

Proporciona una tabla estilizada y funcional con características comunes como:

*   Título
*   Carga de datos (indicador de carga)
*   Columnas personalizables
*   Filas de datos
*   Clave única por fila (`row-key`)
*   Paginación
*   Columna de acciones (Editar/Eliminar) generada automáticamente (si se desea).
*   Soporte para sobrescribir o añadir celdas/columnas específicas desde el componente padre usando slots.

### Props

*   `title` (String, opcional): Título a mostrar encima de la tabla.
*   `rows` (Array, **requerido**): Array de objetos, donde cada objeto representa una fila de datos.
*   `columns` (Array, **requerido**): Array de objetos que definen las columnas (ver [definición de columnas de QTable](https://quasar.dev/vue-components/table#defining-the-columns)).
*   `rowKey` (String, opcional, default: `'id'`): Nombre de la propiedad en los objetos de `rows` que sirve como identificador único para cada fila.
*   `loading` (Boolean, opcional, default: `false`): Si es `true`, muestra un indicador de carga en la tabla.
*   `showEditAction` (Boolean, opcional, default: `true`): Si es `true`, muestra el botón de editar en la columna de acciones.
*   `showDeleteAction` (Boolean, opcional, default: `true`): Si es `true`, muestra el botón de eliminar en la columna de acciones.
*   `inlineEdit` (Boolean, opcional, default: `false`): Propiedad reservada para posible lógica futura de edición en línea (actualmente no implementada).

### Eventos Emitidos

*   `edit-row (row)`: Se emite cuando se hace clic en el botón de editar. El payload es el objeto de la fila (`row`) correspondiente.
*   `delete-row (row)`: Se emite cuando se hace clic en el botón de eliminar. El payload es el objeto de la fila (`row`) correspondiente.

### Slots

Este componente permite pasar slots personalizados para sobrescribir la renderización de celdas específicas, siguiendo la convención de `q-table` (`body-cell-<nombre_columna>`).

```vue
<template v-slot:body-cell-nombreColumna="props">
  <q-td :props="props">
    <!-- Contenido personalizado para la celda -->
    {{ props.value }} <!-- props.value contiene el valor del campo para esta celda -->
  </q-td>
</template>
```

También puedes pasar otros slots de `q-table` como `top`, `bottom`, etc.

### Ejemplo de Uso (en otro componente)

```vue
<template>
  <div>
    <DataTable
      title="Mis Datos"
      :rows="misFilas"
      :columns="misColumnas"
      row-key="identificadorUnico"
      :loading="estaCargando"
      @edit-row="editarElemento"
      @delete-row="eliminarElemento"
    >
      <!-- Slot personalizado para una columna llamada 'estado' -->
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="props.row.activo ? 'green' : 'red'">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>
    </DataTable>
  </div>
</template>

<script>
import { ref } from 'vue';
import DataTable from 'src/components/DataTable.vue';

export default {
  components: { DataTable },
  setup() {
    const estaCargando = ref(false);
    const misFilas = ref([
      { identificadorUnico: 1, nombre: 'Elemento 1', estado: 'Activo', activo: true },
      { identificadorUnico: 2, nombre: 'Elemento 2', estado: 'Inactivo', activo: false },
    ]);
    const misColumnas = ref([
      { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
      { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
      // La columna 'actions' se añade automáticamente si showEditAction o showDeleteAction son true
    ]);

    const editarElemento = (fila) => {
      console.log('Editar:', fila);
    };

    const eliminarElemento = (fila) => {
      console.log('Eliminar:', fila);
    };

    return {
      estaCargando,
      misFilas,
      misColumnas,
      editarElemento,
      eliminarElemento,
    };
  },
};
</script>
```

---

*(Puedes añadir aquí la documentación para futuros componentes)*
