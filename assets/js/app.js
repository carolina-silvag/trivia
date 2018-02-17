$(document).ready(() => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $('#auth').hide();
    } else {
      $('#login-btn').click(login);
      $('#signup-btn').click(signup);
    }
  }); // firebase
});

function login() {
  let email = $('#email').val();
  let pw = $('#pw').val();
  if (email !== '' && pw !== '') {
    const promise = firebase.auth().signInWithEmailAndPassword(email, pw);
    promise.catch(e => alert(e.message));
  }
}

function signup() {
  let email = $('#email').val();
  let pw = $('#pw').val();
  if (email !== '' && pw !== '') {
    const promise = firebase.auth().createUserWithEmailAndPassword(email, pw);
    promise.catch(e => alert(e.message));
  }
}

const parameters = function(event) {
  let difficulty = '&difficulty=' + event.target.innerText.toLowerCase();
  if ($('#type-mult').is(':checked') && $('#type-boolean').is(':checked')) {
    start('', difficulty);
  } else if ($('#type-mult').is(':checked')) {
    start('&type=multiple', difficulty);
  } else if ($('#type-boolean').is(':checked')) {
    start('&type=boolean', difficulty);
  }
};

$('.type-btn').click(parameters);

function start(type, difficulty) {
  $('#home').hide();
  $('#game').show();
  const categories = fetch('https://opentdb.com/api_category.php');
  categories
    .then(response => response.json())
    .then(data => {
      $.each(data.trivia_categories, function(i, category) {
        $('#categories').append(
          `<button data-id="${category.id}" class="btn btn-default options">${
            category.name
          }</button>`
        );
      });
    })
    .then(() => {
      $('#game button').click(event => {
        let categoryID = '&category=' + event.target.getAttribute('data-id');

        const gameData = fetch(
          `https://opentdb.com/api.php?amount=10${categoryID}${difficulty}${type}`
        )
          .then(response => response.json())
          .then(data => {
            $('#game').empty();
            $('#game').append('<ul><ul></ul></ul>');
            console.log(data.results);
            $.each(data.results, (i, question) => {
              $('#game ul:first-child').append(
                `<li><h2>${question.question}</h2></li>`
              );
            });
          });
      });
    });
}