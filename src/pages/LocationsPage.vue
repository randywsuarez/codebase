<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ $t('locations') }} Management</div>
      </q-card-section>

      <q-card-section>
        <q-btn
          color="primary"
          icon="add"
          label="Create Location"
          @click="openCreateDialog"
        />
      </q-card-section>

      <q-card-section>
        <q-table
          title="Locations"
          :rows="locations"
          :columns="columns"
          row-key="id"
          :loading="loading"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                flat
                round
                dense
                color="red"
                icon="delete"
                @click="deleteLocation(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="createDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create Location</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newLocation.name" label="Location Name" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Create" color="primary" @click="createLocation" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Edit Location</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="editingLocation.name" label="Location Name" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Update" color="primary" @click="updateLocation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: 'LocationsPage',
  data() {
    return {
      loading: false,
      locations: [],
      columns: [
        { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
        { name: 'actions', label: 'Actions', align: 'center' },
      ],
      createDialog: false,
      editDialog: false,
      newLocation: {
        name: '',
      },
      editingLocation: {
        id: null,
        name: '',
      },
    };
  },
  mounted() {
    this.loadLocations();
  },
  methods: {
    async loadLocations() {
      this.loading = true;
      try {
        await this.$store.dispatch('locations/loadLocations');
        this.locations = this.$store.state.locations.locations;
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        this.loading = false;
      }
    },
    openCreateDialog() {
      this.newLocation = { name: '' };
      this.createDialog = true;
    },
    openEditDialog(location) {
      this.editingLocation = { ...location };
      this.editDialog = true;
    },
    async createLocation() {
      try {
        await this.$store.dispatch('locations/createLocation', this.newLocation);
        this.createDialog = false;
        this.newLocation = { name: '' };
        await this.loadLocations();
      } catch (error) {
        console.error('Error creating location:', error);
      }
    },
    async updateLocation() {
      try {
        await this.$store.dispatch('locations/updateLocation', this.editingLocation);
        this.editDialog = false;
        this.editingLocation = { id: null, name: '' };
        await this.loadLocations();
      } catch (error) {
        console.error('Error updating location:', error);
      }
    },
    async deleteLocation(location) {
      try {
        await this.$store.dispatch('locations/deleteLocation', location.id);
        await this.loadLocations();
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    },
  },
};
</script>
