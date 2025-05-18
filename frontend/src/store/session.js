export default {
  namespaced: true,
  state: {
    selectedLocationId: null,
  },
  mutations: {
    SET_SELECTED_LOCATION_ID(state, locationId) {
      state.selectedLocationId = locationId;
    },
  },
  actions: {
    setSelectedLocationId({ commit }, locationId) {
      commit('SET_SELECTED_LOCATION_ID', locationId);
    },
  },
  getters: {
    selectedLocationId: (state) => state.selectedLocationId,
  },
};
