import projectsData from 'src/data/projects.json';

export default {
  namespaced: true,
  state: {
    projects: [],
  },
  mutations: {
    SET_PROJECTS(state, projects) {
      state.projects = projects;
    },
    ADD_PROJECT(state, project) {
      state.projects.push(project);
    },
    UPDATE_PROJECT(state, updatedProject) {
      const index = state.projects.findIndex(project => project.id === updatedProject.id);
      if (index !== -1) {
        state.projects.splice(index, 1, updatedProject);
      }
    },
    DELETE_PROJECT(state, projectId) {
      state.projects = state.projects.filter(project => project.id !== projectId);
    },
  },
  actions: {
    loadProjects({ commit }) {
      return new Promise((resolve, reject) => {
        // Mock API call or data loading from file
        setTimeout(() => {
          commit('SET_PROJECTS', projectsData);
          resolve();
        }, 200);
      });
    },
    createProject({ commit, state }, project) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          const newId = Math.random().toString(36).substring(2, 15); // Generate a random ID
          const newProject = { id: newId, ...project };
          commit('ADD_PROJECT', newProject);
          resolve(newProject);
        }, 200);
      });
    },
    updateProject({ commit }, updatedProject) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          commit('UPDATE_PROJECT', updatedProject);
          resolve();
        }, 200);
      });
    },
    deleteProject({ commit }, projectId) {
      return new Promise((resolve, reject) => {
        // Mock API call or data saving to file
        setTimeout(() => {
          commit('DELETE_PROJECT', projectId);
          resolve();
        }, 200);
      });
    },
  },
  getters: {
    allProjects: (state) => state.projects,
  },
};
