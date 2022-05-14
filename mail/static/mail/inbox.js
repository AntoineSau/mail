document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Check is form is submitted
  document.querySelector('form').onsubmit = function () {
    // Get data from form and save it as new email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result in console and "messages" div
      console.log(result);
      document.querySelector('#messages').innerHTML = `<b>${Object.values(result)}</b>`;

      // Displaying manually Sent mailbox, because I want to display the error message if needed, I could also call function
      let mailbox = 'sent';
      document.querySelector('#emails-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      
      // Hide "messages" div and reset its innterhtml to Nonde
      document.querySelector('#messages').style.display = 'block';

      // Show the mailbox name
      document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

      // Fetching data from the requested mailbox {mailbox}
      fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
        // check on Console what data is passed in
        console.log(emails);
        // Looping over all emails from chosen mailbox and print each one: 
        emails.forEach(element => document.querySelector('#emails-view').innerHTML += 
        `<div class="divmails">
        FROM ${element.sender}. 
        TO ${element.recipients}. 
        SUBJECT: ${element.subject}. 
        TIMESTAMP: ${element.timestamp}. 
        READ? ${element.read}.
        </div>`)
      });
    });

    // Stop form from submitting
    return false;

  }

  // By default, load the inbox
  load_mailbox('inbox');

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Hide "messages" div and reset its innterhtml to Nonde
  document.querySelector('#messages').style.display = 'block';
  document.querySelector('#messages').innerHTML = '';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Hide "messages" div and reset its innterhtml to Nonde
  document.querySelector('#messages').style.display = 'block';
  document.querySelector('#messages').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetching data from the requested mailbox {mailbox}
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // check on Console what data is passed in
    console.log(emails);
    // Looping over all emails from chosen mailbox and print each one: 
    emails.forEach(element => { 
      if (element.read === true) {
      document.querySelector('#emails-view').innerHTML += 
    `<div class="divmailsread">
    FROM ${element.sender} 
    TO ${element.recipients}. 
    SUBJECT: ${element.subject}. 
    TIMESTAMP: ${element.timestamp}. 
    (READ? ${element.read}.) Email already READ.
    </div>`;
    } else {
      
      document.querySelector('#emails-view').innerHTML += 
      `<div class="divmails">
      FROM ${element.sender} 
      TO ${element.recipients}. 
      SUBJECT: ${element.subject}. 
      TIMESTAMP: ${element.timestamp}. 
      READ? ${element.read}. Email is UNREAD.
      </div>`;
      }
    }
  )});
}