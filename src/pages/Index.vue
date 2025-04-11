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
                <q-badge rounded class="active-badge" :label="$t('active')" />
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
                :options="['1/5 completed', 'All completed']"
                class="text-caption"
                />
            </div>
            <q-markup-table flat separator="cell">
              <thead>
                <tr>
                  <th class="text-left"><q-checkbox v-model="selectAllTasks" dense/></th>
                  <th class="text-left">{{ $t('task') }}</th>
                  <th class="text-left">{{ $t('assignedTo') }}</th>
                  <th class="text-left">{{ $t('dueDate') }}</th>
                  <th class="text-left">{{ $t('attachments') }}</th>
                  <th class="text-left">{{ $t('actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in profileData.onboardingTasks" :key="task.id">
                  <td><q-checkbox v-model="task.completed" dense/></td>
                  <td class="text-left">{{ task.task }}</td>
                  <td class="text-left">
                    <q-chip square dense>
                      <q-avatar>
                        <img :src="task.avatar">
                      </q-avatar>
                      {{ task.assignedTo }}
                    </q-chip>
                  </td>
                  <td class="text-left">{{ task.dueDate }}</td>
                  <td class="text-left">
                    <q-btn v-if="task.attachments" flat dense round size="sm" icon="attach_file" color="primary"/>
                    <span v-if="task.attachments">{{ task.attachments }}</span>
                  </td>
                  <td class="text-left">
                     <q-btn flat dense round size="sm" icon="edit" color="grey-7" class="q-mr-xs"/>
                     <q-btn flat dense round size="sm" icon="delete" color="grey-7"/>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
             <q-card-actions align="right">
               <q-btn unelevated color="primary" :label="$t('addNewTask')" />
             </q-card-actions>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import profileData from 'src/data/profileData.json'
import { ref } from 'vue'

export default {
  name: 'PageIndex',
  setup () {
    const calendarDate = ref('2020/07/24') // Set initial date for calendar
    const onboardingStatus = ref('1/5 completed')
    const selectAllTasks = ref(false) // Placeholder logic

    // Simple logic to update onboarding status based on completed tasks (can be improved)
    const completedCount = profileData.onboardingTasks.filter(t => t.completed).length;
    const totalTasks = profileData.onboardingTasks.length;
    onboardingStatus.value = `${completedCount}/${totalTasks} completed`;


    return {
      profileData,
      calendarDate,
      onboardingStatus,
      selectAllTasks
    }
  }
}
</script>

<style scoped>
.bg-page-bg {
  background-color: #F4F7FC; /* Match variable */
}
.q-chip {
  border-radius: 4px;
}
.q-table th {
  font-weight: bold;
  color: #757575; /* text-grey */
  font-size: 0.75rem;
}
.q-table td {
   vertical-align: middle;
}
.q-table tbody td .q-chip {
  background-color: transparent !important;
}
.q-table tbody td .q-chip .q-avatar {
  margin-right: 8px;
}
</style>
