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
              <q-item-label caption>{{ $t('viewProfile') }}</q-item-label> <!-- Use translation -->
            </q-item-section>
             <q-item-section side>
               <q-icon name="expand_more" />
             </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- Navigation Links -->
          <q-item
            v-for="link in profileData.sidebarLinks"
            :key="link.title"
            clickable
            v-ripple
            :active="link.title === 'Profile'"
            active-class="text-primary"
            class="q-py-sm"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <!-- Use translation for link titles if available -->
              <q-item-label class="text-weight-medium">{{ $t(link.title.toLowerCase()) || link.title }}</q-item-label>
            </q-item-section>
          </q-item>

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
                       <q-item-label>{{ $t('language') }}</q-item-label> <!-- Use translation -->
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
                   <!-- Add other settings options here -->
                 </q-list>
               </q-menu>
             </q-btn>
             <q-btn round dense flat color="grey-8" icon="power_settings_new" />
           </div>
         </q-toolbar>
       </q-header>

       <!-- Main Content -->
       <!-- Add :key to force re-render on locale change -->
      <router-view :key="$i18n.locale" />
    </q-page-container>
  </q-layout>
</template>

<script>
import profileData from 'src/data/profileData.json'
// Import getCurrentInstance from vue
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { date } from 'quasar' // Import Quasar date utility
import langEnUS from 'quasar/lang/en-us' // Adjusted import path
import langEsES from 'quasar/lang/es'   // Adjusted import path

export default {
  name: 'MainLayout',
  setup () {
    // Get the component instance to access $q and $i18n
    const instance = getCurrentInstance()
    const $q = instance.proxy.$q // Access $q via the instance proxy
    const $i18n = instance.proxy.$i18n // Access $i18n via the instance proxy

    const leftDrawerOpen = ref(false)
    const currentDateTime = ref('')
    let timerId = null

    // Language selection setup
    // Initialize with current locale from the $i18n instance
    // Using 'en-us' and 'es' to match imported language packs
    const selectedLanguage = ref($i18n.locale === 'es-ES' ? 'es' : 'en-us')
    const languageOptions = ref([
      { label: 'english', value: 'en-us' }, // Match language pack code
      { label: 'spanish', value: 'es' }    // Match language pack code
    ])

    // Function to change language
    const changeLanguage = (lang) => {
      // Determine the i18n locale based on the Quasar lang code
      const i18nLocale = lang === 'es' ? 'es-ES' : 'en-US';
      $i18n.locale = i18nLocale // Update the i18n locale

      // Use the $q instance obtained from getCurrentInstance
      if ($q && $q.lang) {
        if (lang === 'en-us') {
          $q.lang.set(langEnUS)
        } else if (lang === 'es') {
          $q.lang.set(langEsES)
        }
      } else {
         console.warn('Could not set Quasar language pack ($q or $q.lang not available).');
      }
      console.log('Language changed to:', lang) // For debugging
      // Optionally: Store preference in localStorage
      // localStorage.setItem('userLanguage', lang)

      // NOTE: We added :key="$i18n.locale" to <router-view> in the template
      // This should force the child component to re-render.
      // If this doesn't work, the next step might be instance.proxy.$forceUpdate()
      // instance.proxy.$forceUpdate(); // Uncomment this as a last resort
       selectedLanguage.value = lang
    }

    // Function to update the date and time
    const updateDateTime = () => {
      const timeStamp = Date.now()
      currentDateTime.value = date.formatDate(timeStamp, 'MMMM D, YYYY, h:mm:ss A')
    }

    // Update time immediately and then every second
    onMounted(() => {
      updateDateTime() // Initial update
      timerId = setInterval(updateDateTime, 1000) // Update every second

      // Initialize Quasar language pack based on the current i18n locale
      const initialQuasarLang = $i18n.locale === 'es-ES' ? 'es' : 'en-us'
      changeLanguage(initialQuasarLang)
      selectedLanguage.value = initialQuasarLang

      // Optionally: Load language preference from localStorage
      // const savedLang = localStorage.getItem('userLanguage')
      // if (savedLang && languageOptions.value.some(opt => opt.value === savedLang)) {
      //   changeLanguage(savedLang)
      //   selectedLanguage.value = savedLang
      // }

      // Ensure selectedLanguage is initialized with the current locale
      // if (!selectedLanguage.value) {
      //   selectedLanguage.value = initialQuasarLang
      // }
    })

    // Clear the interval when the component is unmounted
    onUnmounted(() => {
      if (timerId) {
        clearInterval(timerId)
      }
    })

    return {
      leftDrawerOpen,
      profileData,
      currentDateTime,
      selectedLanguage,
      languageOptions,
      changeLanguage // Expose changeLanguage function
    }
  }
}
</script>

<style lang="scss">
.q-drawer {
  border-right: none !important; // Remove border if drawer bg is white
}
.q-item.q-router-link--active, .q-item--active {
  color: $primary !important;
  background-color: rgba($primary, 0.1);
  border-left: 3px solid $primary;
}
.q-item__section--avatar {
  min-width: 45px; // Adjust icon alignment
}

/* Style for the language dropdown */
.q-menu .q-select .q-field__native,
.q-menu .q-select .q-field__input {
  padding-left: 8px; /* Adjust padding if needed */
}
</style>
