export const operationKeysToolBar = [
  { key: 'rename', variations: ['rename file', 're name', 're-name', 'rename'] },
  { key: 'erase', variations: ['erase', 'araise', 'rise', 'arise', 'erase', 'erase file'] },
  { key: 'select', variations: ['select', 'elect', 'se lect', 'se-lect'] },
  { key: 'copy', variations: ['copy', 'coffee', 'cop pee', 'cop-py'] },
  { key: 'paste', variations: ['paste', 'eight', 'pay st', 'pa-ste'] },
  { key: 'duplicate', variations: ['duplicate', 'duplicate line', 'duplicate lion', 'dupe licate', 'dupli-cate'] },
  { key: 'whitespace', variations: ['whitespace', 'white space', 'white-space', 'whit space'] },
  { key: 'clear', variations: ['clear', 'klear', 'cleer', 'cle-ar'] },
  { key: 'redo', variations: ['redo', 'read', 'red', 're do', 're-do'] },
  { key: 'undo', variations: ['undo', 'un do', 'un-do', 'undoo'] },
  { key: 'font decrease', variations: ['phone decrease','font decrease', 'decrease font', 'decrease text', 'font down', 'smaller font'] },
  { key: 'font increase', variations: ['phone increase','font increase', 'increase font', 'increase text', 'font up', 'larger font'] },
  { key: 'new file', variations: ['new file', 'create new file', 'new doc', 'new document'] },
  { key: 'save file', variations: ['save file', 'save', 'safe file', 'save the file'] },
  { key: 'open', variations: ['open', 'o pen', 'o-pen', 'open file'] },
  { key: 'export file', variations: ['export file', 'export', 'ex port', 'ex-port'] },
  { key: 'print file', variations: ['print file', 'print', 'prnt file', 'preent'] },
  { key: 'zoom in', variations: ['zoom in', 'zoom and', 'zoom-in', 'zoom n'] },
  { key: 'zoom out', variations: ['zoom out', 'zoom-out', 'zoom owt'] },
  { key: 'help', variations: ['help', 'he lp', 'hell p', 'hlp'] },
  { key: 'delete file', variations: ['delete file', 'delete', 'del et', 'de-leet', 'dleet'] },
  { key: 'delete permanent', variations: ['delete permanent', 'permanently delete', 'delete perm', 'delete forever'] },
  { key: 'preferences', variations: ['preferences', 'settings', 'pref erences', 'pre fer ences'] },
  { key: 'set math level', variations: ['set math level','math level','max level','set max level', 'adjust math level', 'math level set', 'set level'] },
  { key: 'send report', variations: ['send report', 'report', 're port', 'reput', 're-port', 'se nd report'] },
  { key: 'contact', variations: ['contact', 'reach out', 'con tact', 'con-tact', 'cntact'] },
  { key: 'use code', variations: ['use code', 'use-codes', 'use co de', 'use-code'] },
  { key: 'subscription', variations: ['subscription', 'sub scription', 'sub scribe', 'subscrip tion','encryption'] },
  { key: 'change password', variations: ['change password', 'update password', 'change pass', 'change pass word'] },
  { key: 'logout', variations: ['logout', 'sign out', 'log out', 'log-out', 'log out'] }
];
  
export const allowedCommands = operationKeysToolBar.map((item,index)=>{
  return {
    text: item.key,
    serial:index+1
  }
})