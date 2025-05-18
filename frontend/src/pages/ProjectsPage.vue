<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ $t('projects') }} Management</div>
      </q-card-section>

      <q-card-section>
        <q-btn
          color="primary"
          icon="add"
          label="Create Project"
          @click="openCreateDialog"
        />
      </q-card-section>

      <q-card-section>
        <q-table
          title="Projects"
          :rows="filteredProjects"
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
                @click="deleteProject(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="createDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create Project</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newProject.name" label="Project Name" />
          <q-select
            v-model="newProject.locationId"
            :options="availableLocations"
            label="Location"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Create" color="primary" @click="createProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Edit Project</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="editingProject.name" label="Project Name" />
          <q-select
            v-model="editingProject.locationId"
            :options="availableLocations"
            label="Location"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Update" color="primary" @click="updateProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: 'ProjectsPage',
  data() {
    return {
      loading: false,
      projects: [],
      columns: [
        { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
        { name: 'locationId', label: 'Location', field: 'locationId', align: 'left', sortable: true },
        { name: 'actions', label: 'Actions', align: 'center' },
      ],
      createDialog: false,
      editDialog: false,
      newProject: {
        name: '',
        locationId: null,
      },
      editingProject: {
        id: null,
        name: '',
        locationId: null,
      },
    };
  },
  computed: {
    availableLocations() {
      return this.$store.state.locations.locations.map(location => ({
        label: location.name,
        value: location.id,
      }));
    },
    filteredProjects() {
      const selectedLocationId = this.$store.state.session.selectedLocationId;
      if (!selectedLocationId) {
        return this.projects;
      }
      return this.projects.filter(project => project.locationId === selectedLocationId);
    },
  },
  mounted() {
    this.loadProjects();
  },
  methods: {
    async loadProjects() {
      this.loading = true;
      try {
        await this.$store.dispatch('projects/loadProjects');
        this.projects = this.$store.state.projects.projects;
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        this.loading = false;
      }
    },
    openCreateDialog() {
      this.newProject = { name: '', locationId: null };
      this.createDialog = true;
    },
    openEditDialog(project) {
      this.editingProject = { ...project };
      this.editDialog = true;
    },
    async createProject() {
      try {
        await this.$store.dispatch('projects/createProject', this.newProject);
        this.createDialog = false;
        this.newProject = { name: '', locationId: null };
        await this.loadProjects();
      } catch (error) {
        console.error('Error creating project:', error);
      }
    },
    async updateProject() {
      try {
        await this.$store.dispatch('projects/updateProject', this.editingProject);
        this.editDialog = false;
        this.editingProject = { id: null, name: '', locationId: null };
        await this.loadProjects();
      } catch (error) {
        console.error('Error updating project:', error);
      }
    },
    async deleteProject(project) {
      try {
        await this.$store.dispatch('projects/deleteProject', project.id);
        await this.loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    },
  },
};
</script>
