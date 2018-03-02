const model = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");

exports.helpCmd = rl => {
    log("Comandos");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar las quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta al quiz indicado");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(' q|quit - salir del programa.');
    rl.prompt();
};


exports.listCmd = rl => {
    log('Listar todos los quizzes existentes.', 'red');
    rl.prompt();
};

exports.showCmd = (rl, id) => {
    log('Mostrar el quiz indicado', 'red');
    rl.prompt();
};

exports.addCmd = rl => {
    log('Añadir un nuevo quiz.', 'red');
    rl.prompt();
};

exports.deleteCmd = (rl, id) => {
    console.log('Borrar el quiz indicado.', 'red');
    rl.prompt();
};

exports.editCmd = (rl, id) => {
    console.log('Editar el quiz indicado.', 'red');
    rl.prompt();
};

exports.testCmd = (rl, id) => {
    console.log('Probar el quiz indicado', 'red');
    rl.prompt();
};

exports.playCmd = rl => {
    console.log('Jugar.', 'red');
    rl.prompt();
};

exports.creditsCmd = rl => {
    console.log('Autores de la práctica:');
    console.log('David Pisonero Fuentes', 'green');
    console.log('Ignacio Ortega Lobo', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};