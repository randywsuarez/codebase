<template>
  <q-table
    :title="title"
    :rows="rows"
    :columns="computedColumns"
    :row-key="rowKey"
    :loading="loading"
    flat
    bordered
    class="q-mt-md"
    table-header-class="text-grey"
    :rows-per-page-options="[10, 25, 50, 0]"
  >
    <template v-slot:body-cell-actions="props">
      <q-td :props="props" class="q-gutter-sm">
        <q-btn
          v-if="showEditAction && !inlineEdit"
          icon="edit"
          color="info"
          flat
          dense
          round
          @click="$emit('edit-row', props.row)"
        >
          <q-tooltip>{{ $t('edit') }}</q-tooltip>
        </q-btn>
        <!-- Placeholder for potential inline edit activation if needed -->
        <!-- <q-btn
          v-if="showEditAction && inlineEdit"
          icon="save"
          color="positive"
          flat
          dense
          round
          @click="$emit('save-row', props.row)"
        >
           <q-tooltip>{{ $t('save') }}</q-tooltip>
        </q-btn> -->
         <q-btn
          v-if="showDeleteAction"
          icon="delete"
          color="negative"
          flat
          dense
          round
          @click="$emit('delete-row', props.row)"
        >
          <q-tooltip>{{ $t('delete') }}</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <!-- Temporarily removed the generic slot loop for debugging -->
    <!--
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
    -->

  </q-table>
</template>

<script>
// Import defineComponent, computed, and getCurrentInstance
import { defineComponent, computed, getCurrentInstance, watch } from 'vue'; // Added watch
// Remove the direct import of useI18n for Vue 3 style
// import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'DataTable',
  props: {
    title: {
      type: String,
      default: '',
    },
    rows: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    showEditAction: {
      type: Boolean,
      default: true,
    },
    showDeleteAction: {
      type: Boolean,
      default: true,
    },
    inlineEdit: { // If true, edit button might behave differently or be hidden
      type: Boolean,
      default: false,
    },
  },
  emits: ['edit-row', 'delete-row'], // Add 'save-row' if implementing inline save
  setup(props, { emit }) {
    // Get the i18n instance from the component context for Vue 2 / Quasar v1
    const { proxy } = getCurrentInstance();
    const t = proxy.$t.bind(proxy); // Bind t to the proxy instance

    // *** DEBUGGING: Log incoming rows ***
    console.log('DataTable props.rows on setup:', JSON.stringify(props.rows));
    watch(() => props.rows, (newRows) => {
      console.log('DataTable props.rows updated:', JSON.stringify(newRows));
    }, { deep: true });
    // *** END DEBUGGING ***

    // Add the actions column dynamically if needed
    const computedColumns = computed(() => {
      const actionsColumnExists = props.columns.some(col => col.name === 'actions');
      if (!actionsColumnExists && (props.showEditAction || props.showDeleteAction)) {
        return [
          ...props.columns,
          {
            name: 'actions',
            label: t('actions'), // Now correctly uses t from the component instance
            align: 'right',
            field: 'actions', // Can be anything, not directly used for data
          },
        ];
      }
      return props.columns;
    });

    return {
      computedColumns,
      // Expose t if needed in the template (already available via $t globally though)
      // t
    };
  },
});
</script>

<style lang="scss">
/* Apply generic table styles, similar to Index.vue */
.q-table th {
  font-weight: bold;
  color: #757575; /* text-grey */
  font-size: 0.75rem;
}

.q-table td {
   vertical-align: middle;
}

/* Ensure action buttons have minimal padding */
.q-table .q-td.q-gutter-sm > .q-btn {
  padding: 4px;
  min-width: 32px;
  min-height: 32px;
}
</style>
