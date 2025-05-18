<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ $t('users') }} Management</div>
      </q-card-section>

      <q-card-section>
        <q-btn
          color="primary"
          icon="add"
          label="Create User"
          @click="openCreateDialog"
        />
      </q-card-section>

      <q-card-section>
        <q-table
          title="Users"
          :rows="users"
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
                @click="deleteUser(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="createDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create User</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newUser.username" label="Username" />
          <q-input v-model="newUser.email" label="Email" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Create" color="primary" @click="createUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Edit User</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="editingUser.username" label="Username" />
          <q-input v-model="editingUser.email" label="Email" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Update" color="primary" @click="updateUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: 'UserPage',
  data() {
    return {
      loading: false,
      users: [],
      columns: [
        { name: 'username', label: 'Username', field: 'username', align: 'left', sortable: true },
        { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
        { name: 'actions', label: 'Actions', align: 'center' },
      ],
      createDialog: false,
      editDialog: false,
      newUser: {
        username: '',
        email: '',
      },
      editingUser: {
        id: null,
        username: '',
        email: '',
      },
    };
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        await this.$store.dispatch('users/loadUsers');
        this.users = this.$store.state.users.users;
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        this.loading = false;
      }
    },
    openCreateDialog() {
      this.newUser = { username: '', email: '' };
      this.createDialog = true;
    },
    openEditDialog(user) {
      this.editingUser = { ...user };
      this.editDialog = true;
    },
    async createUser() {
      try {
        await this.$store.dispatch('users/createUser', this.newUser);
        this.createDialog = false;
        this.newUser = { username: '', email: '' };
        await this.loadUsers();
      } catch (error) {
        console.error('Error creating user:', error);
      }
    },
    async updateUser() {
      try {
        await this.$store.dispatch('users/updateUser', this.editingUser);
        this.editDialog = false;
        this.editingUser = { id: null, username: '', email: '' };
        await this.loadUsers();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    },
    async deleteUser(user) {
      try {
        await this.$store.dispatch('users/deleteUser', user.id);
        await this.loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    },
  },
};
</script>
