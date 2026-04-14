const fs = require('fs');
fetch('http://localhost:3000/api/analyze', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify({ 
    files: [{ name: 'test.pdf', base64: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLdnKxRxgEAIABsAEHgplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjIzCmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNCAwIFI+PgplbmRvYmoKCjQgMCBvYmoKPDwvVHlwZS9QYWdlcy9LaWRzWzEgMCBSXS9Db3VudCAxPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyA0IDAgUj4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMSAwIFJdL0NvdW50IDE+PgplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZgoyMDAwMDAwMDEwIDEwMDAwIG4KMDAwMDAwMDA3NCAwMDAwMCBuCjAwMDAwMDAwOTIgMDAwMDAgbgoyMDAwMDAwMTkzIDEwMDAwIG4KMDAwMDAwMDI0NCAwMDAwMCBuCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgNSAwIFI+PgpzdGFydHhyZWYKMzAxCiUlRU9GCg==' }], 
    language: 'English', 
    profile: {} 
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
