import usersData from 'src/data/users.json';

export default {
  namespaced: true,
  state: {
    users: [],
  },
  mutations: {
    SET_USERS(state, users) {
      state.users = users;
    },
    ADD_USER(state, user) {
      state.users.push(user);
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
      }
    },
    DELETE_USER(state, userId) {
      state.users = state.users.filter(user => user.id !== userId);
    },
  },
  actions: {
    loadUsers({ commit }) {
      return new Promise((resolve, reject) => {
        // Mock API call or data loading from file
        setTimeout(() => {
          commit('SET_USERS', usersData);
          resolve();
        }, 200);
      });
    },
    createUser({ commit, state }, user) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          const newId = Math.random().toString(36).substring(2, 15); // Generate a random ID
          const newUser = { id: newId, ...user };
          commit('ADD_USER', newUser);
          resolve(newUser);
        }, 200);
      });
    },
    updateUser({ commit }, updatedUser) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          commit('UPDATE_USER', updatedUser);
          resolve();
        }, 200);
      });
    },
    deleteUser({ commit }, userId) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          commit('DELETE_USER', userId);
          resolve();
        }, 200);
      });
    },
  },
  getters: {
    allUsers: (state) => state.users,
  },
};
