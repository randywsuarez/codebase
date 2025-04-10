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
              <q-item-label caption>View Profile</q-item-label>
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
              <q-item-label class="text-weight-medium">{{ link.title }}</q-item-label>
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
             <span class="text-caption text-grey-7">July 24, 2020, 4:30 PM</span>
             <q-btn round dense flat color="grey-8" icon="edit" />
             <q-btn round dense flat color="grey-8" icon="notifications">
               <q-badge color="red" text-color="white" floating>2</q-badge>
             </q-btn>
             <q-btn round dense flat color="grey-8" icon="settings" />
             <q-btn round dense flat color="grey-8" icon="power_settings_new" />
           </div>
         </q-toolbar>
       </q-header>

       <!-- Main Content -->
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import profileData from 'src/data/profileData.json'
import { ref } from 'vue'

export default {
  name: 'MainLayout',
  setup () {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      profileData
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
</style>
