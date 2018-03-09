const {models} = require('./model');
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

    models.quiz.findAll()
    .each(quiz => {
        log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

const validateId = id => {

    return new Promise((resolve, reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id = parseInt(id);
            if (Number.isNaN(id)) {
                reject(new Error(`El valor del parámetro <id> no es un número`));
            } else {
                resolve(id);
            }
        }
    });
};

exports.showCmd = (rl, id) => {

    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta' )} ${answer}`);
            rl.prompt();
        });
    });
};

exports.deleteCmd = (rl, id) => {
    if (typeof id==="undefined"){
        errorlog(`Falta el parámetro id.`);
    } else {
        try{
            model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.testCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try{
            const quiz = model.getByIndex(id);
            rl.question(colorize('¿', 'red')+colorize(quiz.question, 'red')+colorize('? ', 'red'), answer =>{
                if(answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                    log('Su respuesta es correcta');
                    //biglog('Correcta', 'green');
                    rl.prompt();
                } else {
                    log('Su respuesta es incorrecta');
                    //biglog('Incorrecta', 'red');
                    rl.prompt();
                }
            });
        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];
    for(var i=0; i<model.count(); i++){
        toBeResolved.push(i);
    }
        if (toBeResolved.length === 0) {
            errorlog('No hay ninguna pregunta');
            rl.prompt();
        } else {
            const playOne = () => {
                if(toBeResolved.length === 0){
                    log('Su puntuación es ' + score);
                    log('Fin, has terminado todas las preguntas.');
                    rl.prompt();
                } else {
                    var id = Math.floor(Math.random() * toBeResolved.length);
                    let quiz = model.getByIndex(toBeResolved[id]);
                    toBeResolved.splice(id, 1);
                    rl.question(colorize('¿', 'red') + colorize(quiz.question, 'red') + colorize('? ', 'red'), answer => {
                        if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                            log('Su respuesta es: correcta');
                            //biglog('Correcta', 'green');
                            score++;
                            //var index = toBeResolved.indexOf(id);
                            playOne();
                        } else {
                            log('Su respuesta es incorrecta\n');
                            //biglog('Incorrecta', 'red');
                            log('Fin, el juego ha terminado');
                            log('Su puntuación es ' + score);
                            rl.prompt();
                        }
                    });
                }
            }
        playOne();
    }
};

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('David Pisonero Fuentes', 'green');
    log('Ignacio Ortega Lobo', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};