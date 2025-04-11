/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.conf.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 **/

import lang from 'quasar/lang/en-us'

import iconSet from 'quasar/icon-set/material-icons'


import Vue from 'vue'

import {Quasar,Notify} from 'quasar'


Vue.use(Quasar, { config: {"brand":{"primary":"#2962FF","secondary":"#00BCD4","accent":"#F57C00","dark":"#1D1D1D","positive":"#4CAF50","negative":"#F44336","info":"#2196F3","warning":"#FFC107","page-bg":"#F4F7FC","card-bg":"#FFFFFF","text-grey":"#757575","text-dark":"#212121","active-green":"#10B981"}},lang: lang,iconSet: iconSet,plugins: {Notify} })
