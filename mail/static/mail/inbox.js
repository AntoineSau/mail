document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Test
  document.querySelector('#test').style.display = 'block';
  document.querySelector('#test').innerHTML = `Test prints here-> ${mailbox}`;

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Test
  document.querySelector('#test').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Test Fetching data from (1.) inbox and (2.) the requested mailbox {mailbox}
  // ERROR inbox and arhcived becasue of recipeints error from Django Admin
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // check on Console what data is passed in
    console.log(emails);
    // Print in HTML
    emails.forEach(element => document.querySelector('#test').innerHTML = `SENT TO ${element.recipients} ON ${element.timestamp}. SUBJECT: ${element.subject}`)
  });


}