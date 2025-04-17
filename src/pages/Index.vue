<template>
  <q-page padding class="bg-page-bg">
    <div class="q-mb-lg">
      <h5 class="text-weight-bold text-dark q-my-none">{{ $t('profileTitle') }}</h5>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Left Column -->
      <div class="col-12 col-md-8">
        <!-- Profile Header Card -->
        <q-card class="q-mb-lg">
          <q-card-section horizontal>
            <q-card-section class="col-auto flex flex-center">
              <q-avatar size="100px">
                <img :src="profileData.user.avatar">
              </q-avatar>
            </q-card-section>

            <q-card-section class="q-py-md">
              <div class="row items-center q-mb-sm">
                <div class="text-h6 text-weight-bold q-mr-sm">{{ profileData.user.name }}</div>
                <q-badge rounded color="positive" text-color="white" :label="$t('active')" />
              </div>
              <div class="row q-col-gutter-x-md q-mb-sm">
                <div class="col-auto">
                  <div class="text-caption text-light-grey">{{ $t('role') }}</div>
                  <div class="text-body2 text-medium-dark">{{ profileData.user.role }}</div>
                </div>
                <div class="col-auto">
                  <div class="text-caption text-light-grey">{{ $t('position') }}</div>
                  <div class="text-body2 text-medium-dark">{{ profileData.user.position }}</div>
                </div>
              </div>
              <div class="text-caption text-light-grey">{{ $t('email') }}</div>
              <div class="text-body2 q-mb-sm text-medium-dark">{{ profileData.user.email }}</div>
              <div class="text-caption text-light-grey">{{ $t('phone') }}</div>
              <div class="text-body2 q-mb-sm text-medium-dark">{{ profileData.user.phone }}</div>
              <div class="text-caption text-light-grey">{{ $t('company') }}</div>
              <div class="text-body2 q-mb-sm text-medium-dark">{{ profileData.user.company }}</div>
              <div>
                <q-btn flat round dense color="primary" icon="fab fa-linkedin-in" type="a" :href="profileData.user.social.linkedin" target="_blank" size="sm" />
                <q-btn flat round dense color="primary" icon="fab fa-facebook-f" type="a" :href="profileData.user.social.facebook" target="_blank" size="sm" />
                <q-btn flat round dense color="primary" icon="fab fa-twitter" type="a" :href="profileData.user.social.twitter" target="_blank" size="sm" />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>

        <!-- Basic Information Card -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6 text-weight-medium text-dark">{{ $t('basicInformation') }}</div>
              <q-btn flat dense round icon="edit" size="sm" color="grey-6" />
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-3">
                <div class="text-caption text-light-grey">{{ $t('hireDate') }}</div>
                <q-chip square dense class="bg-grey-3 text-dark">{{ profileData.basicInfo.hireDate }}</q-chip>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-light-grey">{{ $t('workedFor') }}</div>
                 <q-chip square dense class="bg-grey-3 text-dark">{{ profileData.basicInfo.workedFor }}</q-chip>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-light-grey">{{ $t('employeeId') }}</div>
                 <q-chip square dense class="bg-grey-3 text-dark">{{ profileData.basicInfo.employeeId }}</q-chip>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-light-grey">{{ $t('ssn') }}</div>
                 <q-chip square dense class="bg-grey-3 text-dark">{{ profileData.basicInfo.ssn }}</q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Personal Information Card -->
         <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row justify-between items-center q-mb-md">
              <div class="text-h6 text-weight-medium text-dark">{{ $t('personalInformation') }}</div>
               <q-btn flat dense round icon="edit" size="sm" color="grey-6" />
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-3">
                <div class="text-caption text-light-grey">{{ $t('birthDate') }}</div>
                <div class="text-body2 text-medium-dark">{{ profileData.personalInfo.birthDate }}</div>
              </div>
              <div class="col-12 col-sm-9">
                <div class="text-caption text-light-grey">{{ $t('address') }}</div>
                <div class="text-body2 text-medium-dark">{{ profileData.personalInfo.address }}, {{ profileData.personalInfo.address2 }}</div>
                <div class="text-body2 text-medium-dark">{{ profileData.personalInfo.city }}, {{ profileData.personalInfo.state }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Occupation Information Card -->
        <q-card class="q-mb-lg">
          <q-card-section>
             <div class="row justify-between items-center q-mb-md">
              <div class="text-h6 text-weight-medium text-dark">{{ $t('occupationInformation') }}</div>
               <span class="text-caption text-grey-6">{{ $t('nonEditable') }}</span>
            </div>
             <div class="row q-col-gutter-md items-center">
               <div class="col-12 col-sm-4">
                 <q-chip icon="schedule" :label="profileData.occupationInfo.type" color="teal-1" text-color="teal-8" />
               </div>
               <div class="col-12 col-sm-4">
                 <q-chip icon="business" :label="profileData.occupationInfo.department" color="teal-1" text-color="teal-8" />
               </div>
               <div class="col-12 col-sm-4">
                 <q-chip icon="location_on" :label="profileData.occupationInfo.location" color="teal-1" text-color="teal-8" />
               </div>
             </div>
          </q-card-section>
        </q-card>

      </div>

      <!-- Right Column -->
      <div class="col-12 col-md-4">
        <!-- Calendar Card -->
        <q-card class="q-mb-lg">
          <q-card-section>
             <q-date v-model="calendarDate" minimal flat :key="$i18n.locale"/>
          </q-card-section>
        </q-card>

        <!-- Upcoming Events Card -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="row justify-between items-center q-mb-sm">
              <div class="text-h6 text-weight-medium text-dark">{{ $t('upcomingEvents') }}</div>
              <q-btn unelevated rounded color="orange-1" text-color="orange-8" :label="$t('viewAll')" size="sm" padding="xs md"/>
            </div>
             <div class="text-caption text-light-grey q-mb-md">July 24, 2020</div>

             <q-list separator>
               <q-item v-for="(event, index) in profileData.upcomingEvents" :key="index" class="q-py-md">
                 <q-item-section avatar top>
                    <q-avatar :color="event.color" text-color="white" icon="event" size="md" />
                 </q-item-section>
                 <q-item-section>
                   <q-item-label class="text-weight-medium text-dark">{{ event.title }}</q-item-label>
                   <q-item-label caption>{{ event.time }}</q-item-label>
                   <q-item-label>
                     <q-avatar v-for="(attendee, i) in event.attendees" :key="i" size="sm" class="q-mr-xs">
                       <img :src="attendee">
                     </q-avatar>
                   </q-item-label>
                 </q-item-section>
                 <q-item-section side top>
                   <q-icon name="chevron_right" color="grey-5" />
                 </q-item-section>
               </q-item>
             </q-list>
          </q-card-section>
        </q-card>
      </div>

       <!-- Onboarding Card (Full Width Below) -->
      <div class="col-12">
        <q-card class="onboarding-table">
          <q-card-section>
             <div class="row justify-between items-center q-mb-md">
              <div class="text-h6 text-weight-medium text-dark">{{ $t('onboarding') }}</div>
              <q-select
                dense
                borderless
                v-model="onboardingStatus"
                :options="computedOnboardingOptions"
                class="text-caption text-grey-7"
                readonly
                emit-value
                map-options
                options-dense
                style="min-width: 120px;"
                />
            </div>
            <!-- Use DataTable component - Removed 'flat' prop -->
             <DataTable
              :rows="onboardingTasksRef"
              :columns="onboardingColumns"
              row-key="id"
              :show-edit-action="true"
              :show-delete-action="true"
              :inline-edit="false"
              @edit-row="handleEditTask"
              @delete-row="handleDeleteTask"
              class="q-mt-none"
              bordered
            >
               <!-- Temporarily commented out custom slots for debugging -->
              <!--
              <template v-slot:body-cell-selection="props">
                <q-td :props="props" style="width: 50px; text-align: center;">
                  <q-checkbox v-model="props.row.completed" dense @update:model-value="updateOnboardingStatus"/>
                </q-td>
              </template>

              <template v-slot:body-cell-assignedTo="props">
                <q-td :props="props">
                   <q-chip square dense class="bg-transparent q-pa-none">
                      <q-avatar size="sm" class="q-mr-sm">
                        <img :src="props.row.avatar">
                      </q-avatar>
                      <span class="text-body2 text-medium-dark">{{ props.row.assignedTo }}</span>
                    </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-attachments="props">
                 <q-td :props="props">
                   <q-btn v-if="props.row.attachments" flat dense round size="sm" icon="attach_file" color="primary" class="q-mr-xs"/>
                    <span v-if="props.row.attachments" class="text-primary cursor-pointer">{{ props.row.attachments }}</span>
                 </q-td>
              </template>
              -->

            </DataTable>

             <q-card-actions align="right" class="q-pt-md">
               <q-btn unelevated color="primary" :label="$t('addNewTask')" @click="handleAddNewTask" />
             </q-card-actions>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import profileData from 'src/data/profileData.json'
import { ref, computed, watch, getCurrentInstance } from 'vue' // Import getCurrentInstance
// Remove the direct import of useI18n for Vue 3 style
// import { useI18n } from 'vue-i18n'
import DataTable from 'src/components/DataTable.vue' // Import the component

export default {
  name: 'PageIndex',
  components: {
    DataTable // Register the component
  },
  setup (props, context) { // Add context argument
    // Get the i18n instance from the component context for Vue 2 / Quasar v1
    const { proxy } = getCurrentInstance();
    const t = proxy.$t.bind(proxy); // Bind t to the proxy instance

    const calendarDate = ref('2020/07/24') // Set initial date for calendar
    const onboardingStatus = ref('') // Will be computed

    // Reactive onboarding tasks (start with data from JSON)
    const onboardingTasksRef = ref(profileData.onboardingTasks.map((task, index) => ({
      ...task,
      id: task.id || `task-${index}` // Ensure unique ID
     })));

    // Column definition for the onboarding DataTable - Uses computed now
    const onboardingColumns = computed(() => [
      // NOTE: Column definition for 'selection' is removed temporarily as the slot is commented out
      // { name: 'selection', label: '', align: 'center', field: 'selection', style: 'width: 50px', headerStyle: 'width: 50px' },
      { name: 'task', required: true, label: t('task'), align: 'left', field: 'task', sortable: true },
      // NOTE: We might need to adjust the 'field' if assignedTo slot is removed, or ensure default rendering works
      { name: 'assignedTo', required: true, label: t('assignedTo'), align: 'left', field: 'assignedTo', sortable: true },
      { name: 'dueDate',  required: true, label: t('dueDate'), align: 'left', field: 'dueDate', sortable: true },
      // NOTE: We might need to adjust the 'field' if attachments slot is removed, or ensure default rendering works
      { name: 'attachments', required: true, label: t('attachments'), align: 'left', field: 'attachments', sortable: false },
      // Actions column is added by DataTable component itself
    ]);

    const updateOnboardingStatus = () => {
      const totalTasks = onboardingTasksRef.value.length;
      if (totalTasks === 0) {
          onboardingStatus.value = '0/0 completed';
          return;
      }
      const completedCount = onboardingTasksRef.value.filter(t => t.completed).length;
      onboardingStatus.value = `${completedCount}/${totalTasks} completed`;
    };

    watch(onboardingTasksRef, updateOnboardingStatus, { deep: true, immediate: true });

    const computedOnboardingOptions = computed(() => {
       return [{ label: onboardingStatus.value, value: onboardingStatus.value }];
    });

    const handleEditTask = (task) => {
      console.log('Edit Task:', task);
      alert(t('edit') + ': ' + task.task);
    };

    const handleDeleteTask = (task) => {
      console.log('Delete Task:', task);
      if (confirm(`${t('delete')} task: "${task.task}"?`)) {
         const index = onboardingTasksRef.value.findIndex(t => t.id === task.id);
         if (index !== -1) {
           onboardingTasksRef.value.splice(index, 1);
           alert('Task ' + t('delete') + 'd (locally).');
         }
      }
    };

    const handleAddNewTask = () => {
        console.log('Add new task clicked');
        alert(t('addNewTask') + '...');
    };

    return {
      profileData,
      calendarDate,
      onboardingStatus,
      computedOnboardingOptions,
      onboardingColumns,
      onboardingTasksRef,
      handleEditTask,
      handleDeleteTask,
      handleAddNewTask,
      updateOnboardingStatus,
      t // Expose t for use in the template if needed
    }
  }
}
</script>

<style scoped lang="scss">
.bg-page-bg {
  background-color: white; /* Changed from #F4F7FC */
}
.q-chip {
  border-radius: 4px;
}

/* Style for the active badge in profile header */
.active-badge {
  // Using quasar color variable name directly if SCSS is enabled
  background-color: $positive;
  color: white;
  font-weight: 500;
  padding: 2px 8px;
  font-size: 0.7rem;
  border-radius: 10px; // Make it rounded
}

/* Adjust text colors for better readability */
.text-light-grey {
  color: $grey-6;
}
.text-medium-dark {
  color: $grey-8; // Slightly lighter than pure black
}

/* Specific styles for the onboarding card */
.onboarding-table .q-card__section {
  padding-top: 16px;
  padding-bottom: 16px;
}

/* DataTable specific styles */
.onboarding-table .q-table__container {
  /* Removed explicit border setting, let DataTable handle it */
  /* border: 1px solid $grey-3; */
  border-radius: 4px;
}

/* Remove default background from chips within DataTable cells */
.q-table tbody td .q-chip {
  background-color: transparent !important;
  padding: 0; // Remove extra padding from chip itself
  font-weight: normal; // Ensure normal font weight
}

/* Adjust avatar margin in chip inside table cell */
.q-table tbody td .q-chip .q-avatar {
  margin-right: 8px; // Keep some space
}

/* Ensure checkbox cell has correct width */
.q-table th[data-name="selection"],
.q-table td[data-name="selection"] {
  width: 50px !important;
  padding-left: 16px !important; // Align checkbox visually
  padding-right: 16px !important;
}

/* Adjust action button alignment if needed */
.q-table td.q-td--actions {
  text-align: right;
}

/* Make attachment text look like a link */
.text-primary.cursor-pointer {
   text-decoration: none;
   &:hover {
     text-decoration: underline;
   }
}

/* Style the status dropdown */
.onboarding-table .q-select {
  font-size: 0.8rem;
  font-weight: 500;
}

</style>