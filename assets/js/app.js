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
          `<button data-id="${category.id}" class="btn btn-default get_question">${
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
            let counter = 0;
            $('#game').on('click', '.get_question', function() {
              getQuestion(data.results, counter++);
              // se pasa como argumento los resultados (preguntas+respuestas)
              // y el counter inicializado en 0 aumentando de uno en uno
              // esto es para que cada vez que el usuario responda una pregunta automáticamente avance a la siguiente
            });
          });
      });
    });
}

function getQuestion(data, counter) {
  $('#game').empty(); // se vacía el contenedor para rellenarlo con las preguntas del juego
  $('#game').append(`<h2>${data[counter].question}</h2>`); // se apendiza la pregunta
  let arrQ = []; // nuevo arreglo para meter las respuestas
  data[counter].incorrect_answers.forEach((wrong) => {
    arrQ.push(`<li><button class=" btn btn-default q_w">${wrong}</button></li>`);
  });
  // las respuestas incorrectas llevan la clase q_w
  arrQ.push(`<li><button class="btn btn-default q_r">${data[counter].correct_answer}</button></li>`);
  // la respuesta correcta lleva la clase q_r
  $('#game').append('<ul></ul>'); // se apendiza ul para meter las respuestas
  arrQ.forEach((answer) => {
    randomize($('#game ul').append(answer));
    // se entregan las respuestas apendizadas a la función randomize 
    // para que las ponga en orden aleatorio
  });

  $('#game').append('<div class="result"></div>');
  // eventos para cuando el usuario aprete las respuestas incorrectas o la correcta
  $('.q_w').on(wrongAnswer);
  $('.q_r').on(rightAnswer);
}

function rightAnswer() {
  $('#game .result').html('<h2>Right!</h2><button class="btn btn-success get_question">Next question</button>');
  $('#game ul button').attr('disabled', true);
}

function wrongAnswer() {
  $('#game .result').html('<h2>Wrong!</h2><button class="btn btn-danger get_question">Next question</button>');
  $('#game ul button').attr('disabled', true);
}

// orden aleatorio de las respuestas en cada pregunta
function randomize() {
  const parent = $('#game ul');
  const lis = parent.children();
  while (lis.length) {
    parent.append(lis.splice(Math.floor(Math.random() * lis.length), 1)[0]);
  }
}