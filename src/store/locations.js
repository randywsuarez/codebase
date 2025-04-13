import locationsData from 'src/data/locations.json';

export default {
  namespaced: true,
  state: {
    locations: [],
  },
  mutations: {
    SET_LOCATIONS(state, locations) {
      state.locations = locations;
    },
    ADD_LOCATION(state, location) {
      state.locations.push(location);
    },
    UPDATE_LOCATION(state, updatedLocation) {
      const index = state.locations.findIndex(location => location.id === updatedLocation.id);
      if (index !== -1) {
        state.locations.splice(index, 1, updatedLocation);
      }
    },
    DELETE_LOCATION(state, locationId) {
      state.locations = state.locations.filter(location => location.id !== locationId);
    },
  },
  actions: {
    loadLocations({ commit }) {
      return new Promise((resolve, reject) => {
        // Mock API call or data loading from file
        setTimeout(() => {
          commit('SET_LOCATIONS', locationsData);
          resolve();
        }, 200);
      });
    },
    createLocation({ commit, state }, location) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          const newId = Math.random().toString(36).substring(2, 15); // Generate a random ID
          const newLocation = { id: newId, ...location };
          commit('ADD_LOCATION', newLocation);
          resolve(newLocation);
        }, 200);
      });
    },
    updateLocation({ commit }, updatedLocation) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          commit('UPDATE_LOCATION', updatedLocation);
          resolve();
        }, 200);
      });
    },
    deleteLocation({ commit }, locationId) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          commit('DELETE_LOCATION', locationId);
          resolve();
        }, 200);
      });
    },
  },
  getters: {
    allLocations: (state) => state.locations,
  },
};
