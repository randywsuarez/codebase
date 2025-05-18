<template>
  <q-layout view="lHh Lpr lFf" class="main-layout-gradient">
    <!-- Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="250"
      :breakpoint="700"
      bordered
      content-class="bg-white"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- User Profile Section -->
          <q-item class="q-my-md">
            <q-item-section avatar>
              <q-avatar size="56px">
                <img :src="profileData.user.avatar">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-medium-dark">{{ profileData.user.name }}</q-item-label>
              <q-item-label caption>{{ $t('viewProfile') }}</q-item-label>
            </q-item-section>
             <q-item-section side>
               <q-icon name="expand_more" />
             </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- Navigation Links -->
          <template v-for="link in menuLinks">
            <!-- Regular Menu Item -->
            <q-item
              v-if="!link.children"
              :key="link.title"
              clickable
              v-ripple
              :to="link.link"
              :active="isActive(link.link)"
              active-class="text-primary active-item"
              class="q-py-sm"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ $t(link.title.toLowerCase().replace(/ /g, '')) || link.title }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Expandable Menu Item -->
            <q-expansion-item
              v-else
              :key="link.title"
              :icon="link.icon"
              :label="$t(link.title.toLowerCase().replace(/ /g, '')) || link.title"
              :header-inset-level="0"
              :content-inset-level="0.5"
              expand-separator
              class="text-weight-medium"
              v-model="expansionState[link.title]"
            >
              <!-- Sub-Items -->
              <q-item
                v-for="child in link.children"
                :key="child.title"
                clickable
                v-ripple
                :to="child.link"
                :active="isActive(child.link)"
                active-class="text-primary active-item"
                class="q-py-sm q-pl-lg"
              >
                <q-item-section avatar>
                  <q-icon :name="child.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-regular">{{ $t(child.title.toLowerCase().replace(/ /g, '')) || child.title }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

          <!-- Placeholder for bottom graphic -->
           <div class="q-pa-md absolute-bottom">
             <q-icon name="widgets" size="lg" color="secondary" />
           </div>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
       <!-- Header Bar -->
       <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="58">
         <q-toolbar>
           <q-btn
             flat
             dense
             round
             @click="leftDrawerOpen = !leftDrawerOpen"
             aria-label="Menu"
             icon="menu"
             class="q-mr-sm"
           />

           <!-- Location Selector -->
           <q-select
             v-model="selectedLocationId"
             :options="availableLocations"
             :label="$t('location') || 'Location'"
             dense
             options-dense
             borderless
             emit-value
             map-options
             options-cover
             style="min-width: 150px"
             class="q-ml-md"
             @update:model-value="handleLocationChange"
           >
            <template v-slot:prepend>
              <q-icon name="public" color="grey-7" />
            </template>
           </q-select>

           <!-- Project Selector -->
           <q-select
             v-model="selectedProjectId"
             :options="availableProjects"
             :label="$t('project') || 'Project'"
             dense
             options-dense
             borderless
             emit-value
             map-options
             options-cover
             style="min-width: 150px"
             class="q-ml-sm"
             :disable="!selectedLocationId"
             @update:model-value="handleProjectChange"
           >
            <template v-slot:prepend>
              <q-icon name="account_tree" color="grey-7" />
            </template>
           </q-select>


           <q-space />

           <!-- Right side icons -->
           <div class="q-gutter-sm row items-center no-wrap">
             <!-- Display Current Date and Time -->
             <span class="text-caption text-grey-7 q-mr-md">{{ currentDateTime }}</span>
             <q-btn round dense flat color="grey-8" icon="edit" />
             <q-btn round dense flat color="grey-8" icon="notifications">
               <q-badge color="red" text-color="white" floating>2</q-badge>
             </q-btn>
             <!-- Settings Button with Menu -->
             <q-btn round dense flat color="grey-8" icon="settings">
               <q-menu anchor="bottom right" self="top right" transition-show="scale" transition-hide="scale">
                 <q-list style="min-width: 180px" dense>
                   <q-item-label header class="text-caption">{{ $t('language') }}</q-item-label>

                   <!-- English Language Option -->
                   <q-item clickable v-close-popup @click="changeLanguage('en-us')" :active="selectedLanguage === 'en-us'" active-class="text-primary bg-grey-2">
                     <q-item-section avatar style="min-width: 40px;">
                       <q-icon name="language" size="xs" />
                     </q-item-section>
                     <q-item-section>
                       <q-item-label>{{ $t('english') }}</q-item-label>
                     </q-item-section>
                     <q-item-section side v-if="selectedLanguage === 'en-us'">
                        <q-icon name="done" color="primary" size="xs" />
                     </q-item-section>
                   </q-item>

                   <!-- Spanish Language Option -->
                   <q-item clickable v-close-popup @click="changeLanguage('es')" :active="selectedLanguage === 'es'" active-class="text-primary bg-grey-2">
                      <q-item-section avatar style="min-width: 40px;">
                       <q-icon name="language" size="xs" />
                     </q-item-section>
                     <q-item-section>
                       <q-item-label>{{ $t('spanish') }}</q-item-label>
                     </q-item-section>
                      <q-item-section side v-if="selectedLanguage === 'es'">
                        <q-icon name="done" color="primary" size="xs" />
                     </q-item-section>
                   </q-item>

                   <q-separator class="q-my-sm" />

                   <!-- Other Settings Options -->
                   <q-item clickable v-close-popup to="/profile">
                     <q-item-section avatar style="min-width: 40px;">
                       <q-icon name="account_circle" size="xs"/>
                     </q-item-section>
                     <q-item-section>{{ $t('profile') }}</q-item-section>
                   </q-item>
                  <q-item clickable v-close-popup @click="logoutUser">
                     <q-item-section avatar style="min-width: 40px;">
                       <q-icon name="logout" size="xs" />
                     </q-item-section>
                     <q-item-section>{{ $t('logout') }}</q-item-section>
                   </q-item>
                 </q-list>
               </q-menu>
             </q-btn>
             <q-btn round dense flat color="grey-8" icon="power_settings_new" @click="logoutUser" />
           </div>
         </q-toolbar>
       </q-header>

       <!-- Router View -->
       <router-view :key="routeKey" />
    </q-page-container>
  </q-layout>
</template>

<script>
import profileData from 'src/data/profileData.json'
import menuLinks from 'src/data/menu.json'
import allLocationsData from 'src/data/locations.json' // Import locations
import allProjectsData from 'src/data/projects.json' // Import projects
import { date } from 'quasar'
import langEnUS from 'quasar/lang/en-us'
import langEsES from 'quasar/lang/es'

export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      currentDateTime: '',
      timerId: null,
      profileData: profileData,
      menuLinks: menuLinks,
      selectedLanguage: this.$i18n.locale === 'es-ES' ? 'es' : 'en-us',
      expansionState: {},
      allLocations: allLocationsData,
      allProjects: allProjectsData,
      selectedLocationId: null,
      selectedProjectId: null,
      availableProjects: []
    }
  },
  computed: {
    quasarLangPack () {
      return this.selectedLanguage === 'es' ? langEsES : langEnUS;
    },
    availableLocations () {
      return this.allLocations.map(loc => ({ label: loc.name, value: loc.id }));
    },
    routeKey() {
      return `${this.$route.fullPath}?loc=${this.selectedLocationId || ''}&proj=${this.selectedProjectId || ''}&lang=${this.$i18n.locale}`;
    }
  },
  watch: {
    '$i18n.locale': function (newLocale) {
      const langCode = newLocale === 'es-ES' ? 'es' : 'en-us';
      this.selectedLanguage = langCode;
      this.$q.lang.set(this.quasarLangPack);
    },
    '$route': {
      immediate: true,
      handler() {
        this.initializeExpansionState();
      }
    },
    expansionState: {
      handler(newState) {
        localStorage.setItem('expansionState', JSON.stringify(newState));
      },
      deep: true // Watch for changes inside the object
    }
  },
  mounted () {
    this.updateDateTime();
    this.timerId = setInterval(this.updateDateTime, 1000);
    this.$q.lang.set(this.quasarLangPack);

    // Load expansion state from localStorage
    const storedState = localStorage.getItem('expansionState');
    if (storedState) {
      try {
        this.expansionState = JSON.parse(storedState);
      } catch (e) {
        console.warn('Failed to parse expansionState from localStorage');
      }
    }

    this.initializeExpansionState();
  },
  beforeDestroy () {
    if (this.timerId) {
      clearInterval(this.timerId)
    }
  },
  methods: {
    isActive (linkPath) {
      if (!linkPath || linkPath === '#') return false;
      const targetPath = linkPath.startsWith('#') ? linkPath.substring(1) : linkPath;
      return this.$route.path === ('/' + targetPath) || this.$route.path.startsWith('/' + targetPath); //Modified line
    },
    isParentActive (parentLink) {
      if (!parentLink.children) return false;
      return parentLink.children.some(child => this.isActive(child.link));
    },
    changeLanguage (lang) {
      const i18nLocale = lang === 'es' ? 'es-ES' : 'en-US';
      this.$i18n.locale = i18nLocale
      this.$q.lang.set(this.quasarLangPack)
      this.selectedLanguage = lang
    },
    updateDateTime () {
      const timeStamp = Date.now()
      this.currentDateTime = date.formatDate(timeStamp, 'MMMM D, YYYY, h:mm:ss A')
    },
    initializeExpansionState() {
      const newState = {};
      this.menuLinks.forEach(link => {
        if (link.children) {
          newState[link.title] = this.isParentActive(link);
        }
      });
      this.expansionState = newState;
    },
    handleLocationChange (newLocationId) {
      this.selectedLocationId = newLocationId;
      this.filterProjectsByLocation(newLocationId);
      this.selectedProjectId = null;
    },
    filterProjectsByLocation(locationId) {
      if (!locationId) {
        this.availableProjects = [];
        return;
      }
      const filtered = this.allProjects
        .filter(proj => proj.locationId === locationId)
        .map(proj => ({ label: proj.name, value: proj.id }));
      this.availableProjects = filtered;
    },
    handleProjectChange(newProjectId) {
      this.selectedProjectId = newProjectId;
    },
    logoutUser() {
      // TODO: Implement actual logout logic (clear token, redirect, etc.)
      console.log('Logout action triggered');
    }
  }
}
</script>
