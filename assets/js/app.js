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

// función para obtener parámetros de tipo (multiple/boolean) y dificultad (easy/medium/hard)
// que irán dentro de la llamada a la api

// los checkboxes de type-mult y type-boolean están en el menu del nav

// se le da como parámetro el botón en el cual se desencadenó el evento (easy - medium - hard)
const parameters = function(event) {
  let difficulty = '&difficulty=' + event.target.innerText.toLowerCase(); // se usa el texto como parámetro
  if ($('#type-mult').is(':checked') && $('#type-boolean').is(':checked')) {
    start('', difficulty); 
    // si se chequean ambos no se pasa ningún texto como parámetro para que la api entregue 
    // resultados aleatorios + la dificultad obtenida del botón en el que se desencadenó el evento
  } else if ($('#type-mult').is(':checked')) {
    start('&type=multiple', difficulty); 
    // si se chequea type-mult se pasa como parámetro multiple para que la api solo entregue 
    // preguntas de selección multiple + la dificultad
  } else if ($('#type-boolean').is(':checked')) {
    start('&type=boolean', difficulty);
    // si se chequea type-boolean se pasa como parámetro boolean para que la api solo entregue
    // preguntas de verdadero o falso
  }
};

$('.type-btn').click(parameters); 
// acá se ejecuta la función anterior en el evento 
// click sobre cualquiera de los botones de dificultad (easy -medium - hard)

function start(type, difficulty) {
  $('#home').hide(); // se esconde la vista inicial 
  $('#game').show();
  const categories = fetch('https://opentdb.com/api_category.php'); 
  // se llama a la api por primera vez para obtener la lista de categorías disponibles
  categories
    .then(response => response.json())
    .then(data => {
      $.each(data.trivia_categories, function(i, category) {
        $('#categories').append(
          // se apendiza cada una de las categorías bajo el botón all-categories que entrega resultados aleatorios
          // también se le agrega un atributo data del id específico de cada categoría para llamarlo como parámetro con la api
          `<button data-id="${category.id}" class="btn btn-default options">${
            category.name
          }</button>`
        );
      });
    })
    .then(() => {
      // cuando se hace click en el botón de una categoría, su id se entrega como parámetro en el llamado de la api
      $('#game button').click(event => {
        let categoryID = '&category=' + event.target.getAttribute('data-id');

        const gameData = fetch(
          `https://opentdb.com/api.php?amount=10${categoryID}${difficulty}${type}`
          // ejemplo: https://opentdb.com/api.php?amount=10&category=3&difficulty=easy&type=boolean
        )
          .then(response => response.json())
          .then(data => {
            $('#game').empty(); // se vacía el contenedor para rellenarlo con las preguntas del juego
            $('#game').append('<ul><ul></ul></ul>'); // se agrega una lista para introducir la data de preguntas/respuestas
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