<template>
  <q-layout view="lHh Lpr lFf" class="main-layout-gradient">
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

           <q-space />

           <div class="q-gutter-sm row items-center no-wrap">
             <!-- Display Current Date and Time -->
             <span class="text-caption text-grey-7">{{ currentDateTime }}</span>
             <q-btn round dense flat color="grey-8" icon="edit" />
             <q-btn round dense flat color="grey-8" icon="notifications">
               <q-badge color="red" text-color="white" floating>2</q-badge>
             </q-btn>
             <!-- Settings Button with Menu -->
             <q-btn round dense flat color="grey-8" icon="settings">
               <q-menu anchor="bottom right" self="top right" transition-show="flip-up" transition-hide="flip-down">
                 <q-list style="min-width: 150px">
                   <q-item>
                     <q-item-section>
                       <q-item-label>{{ $t('language') }}</q-item-label>
                     </q-item-section>
                   </q-item>
                   <q-item dense>
                     <q-item-section>
                      <q-btn-group spread>
                        <q-btn flat dense @click="changeLanguage('en-us')" icon="flag:us" :label="$t('english')" /> 
                        <q-btn flat dense @click="changeLanguage('es')" icon="flag:es" :label="$t('spanish')" />
                      </q-btn-group>
                     </q-item-section>
                   </q-item>
                 </q-list>
               </q-menu>
             </q-btn>
             <q-btn round dense flat color="grey-8" icon="power_settings_new" />
           </div>
         </q-toolbar>
       </q-header>

       <router-view :key="$route.fullPath" /> 
    </q-page-container>
  </q-layout>
</template>

<script>
import profileData from 'src/data/profileData.json'
import menuLinks from 'src/data/menu.json'
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
      languageOptions: [
        { label: 'english', value: 'en-us' }, 
        { label: 'spanish', value: 'es' }    
      ],
      expansionState: {} 
    }
  },
  computed: {
    quasarLangPack () {
      return this.selectedLanguage === 'es' ? langEsES : langEnUS;
    }
  },
  methods: {
    isActive (linkPath) {
      if (!linkPath || linkPath === '#') return false;
      const targetPath = linkPath.startsWith('#') ? linkPath.substring(1) : linkPath;
      // Use base path comparison for Vue Router 3
      return this.$route.path === ('/' + targetPath) || this.$route.path.startsWith('/' + targetPath + '/');
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
      // Use Vue.set to ensure reactivity for new properties in Vue 2
      this.$set(this, 'expansionState', newState);
    }
  },
  watch: {
    '$i18n.locale': function (newLocale) {
      const langCode = newLocale === 'es-ES' ? 'es' : 'en-us';
      this.selectedLanguage = langCode;
      this.$q.lang.set(this.quasarLangPack);
    },
    '$route': {
      immediate: true, // Run the handler immediately on component creation
      handler() {
        this.initializeExpansionState();
      }
    }
  },
  mounted () {
    this.updateDateTime()
    this.timerId = setInterval(this.updateDateTime, 1000)
    this.$q.lang.set(this.quasarLangPack);
    // Initialization now handled by the immediate watcher for $route
    // this.initializeExpansionState(); 
  },
  beforeDestroy () {
    if (this.timerId) {
      clearInterval(this.timerId)
    }
  }
}
</script>

<style lang="scss">
.q-drawer {
  border-right: none !important;
}

.active-item {
  color: $primary !important;
  background-color: rgba($primary, 0.1);
  border-left: 3px solid $primary;
}

.q-expansion-item__container > .q-item {
  font-weight: 500; 
}

.q-expansion-item--expanded > .q-item {

}

.q-expansion-item__content .q-item.active-item {
  font-weight: 500; 
  padding-left: 1.5rem !important; 
}

.q-expansion-item__content .q-item {
    font-weight: 400; 
    padding-left: 1.5rem !important; 
}

.q-item__section--avatar {
  min-width: 45px;
}

.q-menu .q-select .q-field__native,
.q-menu .q-select .q-field__input {
  padding-left: 8px;
}
</style>