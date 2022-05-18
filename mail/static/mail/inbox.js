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
      
      // Show "messages" div
      document.querySelector('#messages').style.display = 'block';

      // Hide emails div
      document.querySelector('#emails').style.display = 'none';
    
      // Show the mailbox name
      document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

      // Fetching data from the requested mailbox {mailbox}
      fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails => {
        // check on Console what data is passed in
        console.log(emails);
        // Looping over all emails from chosen mailbox and print each one, checking if email is read or not
        emails.forEach(element => { 
          if (element.read === true) {
          document.querySelector('#emails-view').innerHTML += 
        `<div class="divmailsread">
        FROM ${element.sender} 
        TO ${element.recipients}. 
        SUBJECT: ${element.subject}. 
        TIMESTAMP: ${element.timestamp}. 
        Email already READ.
        <a href="javascript:void(0);" onclick="view_email(${element.id});">Open email</a>
        </div>`;
        } else {
          
          document.querySelector('#emails-view').innerHTML += 
          `<div class="divmails">
          FROM ${element.sender} 
          TO ${element.recipients}. 
          SUBJECT: ${element.subject}. 
          TIMESTAMP: ${element.timestamp}. 
          Email is UNREAD.
          <a href="javascript:void(0);" onclick="view_email(${element.id});">Open email</a>
          </div>`;
          }
        }
      )});
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
  
  // Hide "messages" div and reset its innterhtml to None
  document.querySelector('#messages').style.display = 'block';
  document.querySelector('#messages').innerHTML = '';

  // Hide emails div
  document.querySelector('#emails').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  console.log(email);
  
  // Hide "messages" div and reset its innterhtml to None
  document.querySelector('#messages').style.display = 'block';
  // Print to check if email id is passed in
  // document.querySelector('#messages').innerHTML = `We want to reply to an email number ${email}`;

  // Hide emails div
  document.querySelector('#emails').style.display = 'none';

  // Retrieve email data to populate fields
  fetch(`/emails/${email}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    // Populate composition fields with data from email that we answer to
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    if (email.subject.includes('Re: ') === true) {
      document.querySelector('#compose-subject').value = `${email.subject}`; 
    } else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote "${email.body}"`;
  
  });

}

function unarchive_email(emailid) {
  // Mark this email as UNARCHIVED
  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(response => {
    console.log(response);
    load_mailbox('inbox');
  });
  
}

function archive_email(emailid) {
  // Mark this email as UNARCHIVED
  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(response => {
    console.log(response);
    load_mailbox('inbox');
  });
}

function view_email(emailid) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Hide "messages" div and reset its innerhtml to None
  document.querySelector('#messages').style.display = 'block';
  document.querySelector('#messages').innerHTML = '';

  // Mark this email as READ
  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // Get the email with GET request
  fetch(`/emails/${emailid}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
   
    // Show emails div, empty it be default, and populate it with relevant content
    document.querySelector('#emails').style.display = 'block';
    document.querySelector('#emails').innerHTML = '';
    document.querySelector('#emails').innerHTML += `<p><b>From:</b> ${email.sender}</p>`;
    document.querySelector('#emails').innerHTML += `<p><b>To:</b> ${email.recipients}</p>`;
    document.querySelector('#emails').innerHTML += `<p><b>Subject:</b> ${email.subject}</p>`;
    document.querySelector('#emails').innerHTML += `<p><b>Timestamp:</b> ${email.timestamp}</p>`;
    // Adding a button for the user to reply and apply it a function
    document.querySelector('#emails').innerHTML += `<button onclick="reply_email(${email.id})" class="btn btn-sm btn-outline-primary" id="replytoemail">Reply</button>`;

    // If email is from "Archived", add button to unarchive email -> Unarchive email
    console.log('PRINT');
    // not very elegant way to get user email :)
    let user = document.querySelector('h2').innerHTML;
    console.log(user);
    console.log(email.recipients);
    // archive must be true! 
    if (email.archived === true) {
      document.querySelector('#emails').innerHTML += `<br><br><button onclick="unarchive_email(${email.id})" class="btn btn-sm btn-outline-secondary" id="unarchive">Unarchive email</button>`;
    // If email is from "Inbox", add button to archive email -> archive email
    // archive must be false (OK here) and recipient shodul include user
    } else if (email.recipients.includes(user) === true) {
      document.querySelector('#emails').innerHTML += `<br><br><button onclick="archive_email(${email.id})" class="btn btn-sm btn-outline-secondary" id="archive">Archive email</button>`;
    }
    
    // Displaying a solid line and the body of the email
    document.querySelector('#emails').innerHTML += `<hr>`;
    document.querySelector('#emails').innerHTML += `<p>${email.body}</p>`;
    
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  });
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Hide "messages" div and reset its innerhtml to None
  document.querySelector('#messages').style.display = 'block';
  document.querySelector('#messages').innerHTML = '';

  // Hide emails div
  document.querySelector('#emails').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetching data from the requested mailbox {mailbox}
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // check on Console what data is passed in
    console.log(emails);
    // Looping over all emails from chosen mailbox and print each one, checking if email is read or not
    emails.forEach(element => { 
      if (element.read === true) {
      document.querySelector('#emails-view').innerHTML += 
    `<div class="divmailsread">
    FROM ${element.sender} 
    TO ${element.recipients}. 
    SUBJECT: ${element.subject}. 
    TIMESTAMP: ${element.timestamp}. 
    Email already READ.
    <a href="javascript:void(0);" onclick="view_email(${element.id});">Open email</a>
    </div>`;
    } else {
      
      document.querySelector('#emails-view').innerHTML += 
      `<div class="divmails">
      FROM ${element.sender} 
      TO ${element.recipients}. 
      SUBJECT: ${element.subject}. 
      TIMESTAMP: ${element.timestamp}. 
      Email is UNREAD.
      <a href="javascript:void(0);" onclick="view_email(${element.id});">Open email</a>
      </div>`;
      }
    }
  )});
}